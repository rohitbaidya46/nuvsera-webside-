import QRCode from "qrcode";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { LOCK_MINUTES, MAX_FAILED_LOGINS, destroySession, getSession, passwordExpired } from "@/lib/auth";
import { decrypt, encrypt, randomToken, sha256 } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateSecret, otpauthUrl, verifyTotp } from "@/lib/totp";

async function pendingSession() {
  const s = await getSession();
  if (!s) throw new HttpError(401, "Your session has expired. Please sign in again.");
  return s;
}

/** Returns setup data (QR code) for users who have not enrolled yet. */
export const GET = route(async () => {
  const s = await pendingSession();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: s.user.id } });
  if (user.totpEnabled) return json({ ok: true, mode: "verify" });
  let secret = user.totpSecret ? decrypt(user.totpSecret) : null;
  if (!secret) {
    secret = generateSecret();
    await prisma.user.update({ where: { id: user.id }, data: { totpSecret: encrypt(secret) } });
  }
  const url = otpauthUrl(secret, user.email);
  return json({ ok: true, mode: "setup", secret, qr: await QRCode.toDataURL(url, { margin: 1, width: 220 }) });
});

const schema = z.object({ code: z.string().trim().min(6).max(20) });

export const POST = route(async (req: Request) => {
  const s = await pendingSession();
  await enforceRateLimit(`2fa:${s.user.id}`, 10, 15 * 60);
  const { code } = schema.parse(await req.json());
  const user = await prisma.user.findUniqueOrThrow({ where: { id: s.user.id } });
  if (!user.totpSecret) throw new HttpError(400, "Two-factor setup has not started.");
  const secret = decrypt(user.totpSecret);
  const actor = { id: user.id, email: user.email };

  let ok = verifyTotp(secret, code);
  let usedRecovery = false;
  if (!ok && user.totpEnabled) {
    const h = sha256(code.replace(/[\s-]/g, "").toUpperCase());
    if (user.recoveryCodes.includes(h)) {
      ok = true;
      usedRecovery = true;
      await prisma.user.update({ where: { id: user.id }, data: { recoveryCodes: user.recoveryCodes.filter((c) => c !== h) } });
    }
  }

  if (!ok) {
    const failed = user.failedLogins + 1;
    if (failed >= MAX_FAILED_LOGINS) {
      await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000) } });
      await destroySession();
      await audit(actor, "auth.account.locked", { details: { reason: "2fa" } });
      throw new HttpError(423, `Too many incorrect codes. The account is locked for ${LOCK_MINUTES} minutes.`);
    }
    await prisma.user.update({ where: { id: user.id }, data: { failedLogins: failed } });
    await audit(actor, "auth.2fa.failed");
    throw new HttpError(401, "That code is not valid. Check your authenticator app and try again.");
  }

  let recoveryCodes: string[] | undefined;
  const data: Record<string, unknown> = { failedLogins: 0, lastLoginAt: new Date() };
  if (!user.totpEnabled) {
    recoveryCodes = Array.from({ length: 8 }, () => randomToken(6).replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase().padEnd(8, "X"));
    data.totpEnabled = true;
    data.recoveryCodes = recoveryCodes.map((c) => sha256(c));
  }
  await prisma.user.update({ where: { id: user.id }, data });
  await prisma.session.update({ where: { id: s.id }, data: { twoFactorVerified: true } });
  await audit(actor, recoveryCodes ? "auth.2fa.enabled" : usedRecovery ? "auth.login.recovery_code" : "auth.login.success");
  return json({ ok: true, recoveryCodes, next: passwordExpired(user) ? "/admin/change-password" : "/admin" });
});
