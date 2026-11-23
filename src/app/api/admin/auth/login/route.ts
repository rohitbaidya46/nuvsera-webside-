import { z } from "zod";
import { audit } from "@/lib/audit";
import { LOCK_MINUTES, MAX_FAILED_LOGINS, createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { hashIp } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { layout } from "@/lib/email/templates";
import { HttpError, clientIp, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200), password: z.string().min(1).max(200) });
// Constant-time-ish behaviour for unknown accounts (prevents user enumeration by timing).
let dummyHash: Promise<string> | null = null;
const getDummy = () => (dummyHash ??= hashPassword("not-a-real-password"));

export const POST = route(async (req: Request) => {
  const ip = await clientIp();
  await enforceRateLimit(`login-ip:${hashIp(ip)}`, 20, 15 * 60);
  const { email, password } = schema.parse(await req.json());
  await enforceRateLimit(`login-email:${email}`, 10, 15 * 60);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    await verifyPassword(password, await getDummy());
    await audit(null, "auth.login.failed", { details: { email, reason: "unknown_or_inactive" } });
    throw new HttpError(401, "Incorrect email or password.");
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new HttpError(423, `This account is temporarily locked after too many failed attempts. Try again in ${mins} minute(s) or reset your password.`);
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = user.failedLogins + 1;
    const lock = failed >= MAX_FAILED_LOGINS;
    await prisma.user.update({
      where: { id: user.id },
      data: lock ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000) } : { failedLogins: failed },
    });
    await audit({ id: user.id, email: user.email }, lock ? "auth.account.locked" : "auth.login.failed", { entity: "user", entityId: user.id });
    if (lock) {
      const s = await getSettings();
      await sendMail({
        to: user.email,
        subject: "Your admin account was temporarily locked",
        html: layout(s, { preheader: "Security notice", title: "Account temporarily locked", bodyHtml: `<p>We locked your admin account for ${LOCK_MINUTES} minutes after ${MAX_FAILED_LOGINS} failed sign-in attempts. If this wasn’t you, reset your password and inform your Super Admin.</p>` }),
        text: `Your admin account was locked for ${LOCK_MINUTES} minutes after repeated failed sign-in attempts. If this wasn't you, reset your password.`,
      });
      throw new HttpError(423, `Too many failed attempts. The account is locked for ${LOCK_MINUTES} minutes.`);
    }
    throw new HttpError(401, `Incorrect email or password. ${MAX_FAILED_LOGINS - failed} attempt(s) left before the account is locked.`);
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
  await createSession(user.id);
  await audit({ id: user.id, email: user.email }, "auth.login.password_ok", { entity: "user", entityId: user.id });
  return json({ ok: true, next: "/admin/two-factor" });
});
