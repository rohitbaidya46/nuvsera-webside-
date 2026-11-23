import { z } from "zod";
import { audit } from "@/lib/audit";
import { getSession, hashPassword, passwordSchema, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({ current: z.string().min(1).max(200), password: passwordSchema });

export const POST = route(async (req: Request) => {
  const s = await getSession();
  if (!s || !s.twoFactorVerified) throw new HttpError(401, "Not authenticated");
  await enforceRateLimit(`chpw:${s.user.id}`, 10, 15 * 60);
  const { current, password } = schema.parse(await req.json());
  const user = await prisma.user.findUniqueOrThrow({ where: { id: s.user.id } });
  if (!(await verifyPassword(current, user.passwordHash))) throw new HttpError(422, "Current password is incorrect.", { current: "Incorrect password" });
  if (await verifyPassword(password, user.passwordHash)) throw new HttpError(422, "Choose a password you have not used before.", { password: "Must differ from your current password" });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password), passwordChangedAt: new Date(), mustChangePassword: false } });
  await prisma.session.deleteMany({ where: { userId: user.id, id: { not: s.id } } });
  await audit({ id: user.id, email: user.email }, "auth.password.changed");
  return json({ ok: true, next: "/admin" });
});
