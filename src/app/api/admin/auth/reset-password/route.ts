import { z } from "zod";
import { audit } from "@/lib/audit";
import { hashPassword, passwordSchema } from "@/lib/auth";
import { hashIp, sha256 } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { HttpError, clientIp, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";

export const POST = route(async (req: Request) => {
  await enforceRateLimit(`reset:${hashIp(await clientIp())}`, 10, 3600);
  const { token, password } = z.object({ token: z.string().min(20).max(200), password: passwordSchema }).parse(await req.json());
  const rec = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date() || !rec.user.isActive) throw new HttpError(400, "This reset link is invalid or has expired. Please request a new one.");
  await prisma.$transaction([
    prisma.user.update({ where: { id: rec.userId }, data: { passwordHash: await hashPassword(password), passwordChangedAt: new Date(), mustChangePassword: false, failedLogins: 0, lockedUntil: null } }),
    prisma.passwordResetToken.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: rec.userId, usedAt: null } }),
    prisma.session.deleteMany({ where: { userId: rec.userId } }),
  ]);
  await audit({ id: rec.user.id, email: rec.user.email }, "auth.password.reset");
  return json({ ok: true });
});
