import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./db";
import { env } from "./env";
import { randomToken, sha256 } from "./crypto";
import { HttpError, clientIp, userAgent } from "./http";
import { can, type Permission } from "./permissions";
import { SESSION_COOKIE } from "./session-cookie";

export const SESSION_ABSOLUTE_MS = 12 * 60 * 60 * 1000; // 12 hours
export const SESSION_IDLE_MS = 2 * 60 * 60 * 1000; // 2 hours of inactivity
export const PASSWORD_MAX_AGE_DAYS = 90;
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .max(128)
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol");

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

export type SessionUser = Pick<User, "id" | "name" | "email" | "role" | "totpEnabled" | "passwordChangedAt" | "mustChangePassword">;
export type AdminSession = { id: string; twoFactorVerified: boolean; user: SessionUser };

export function passwordExpired(u: Pick<User, "passwordChangedAt" | "mustChangePassword">) {
  return u.mustChangePassword || Date.now() - u.passwordChangedAt.getTime() > PASSWORD_MAX_AGE_DAYS * 86400_000;
}

export async function createSession(userId: string) {
  const token = randomToken(32);
  await prisma.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_ABSOLUTE_MS),
      ipAddress: await clientIp(),
      userAgent: await userAgent(),
    },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_ABSOLUTE_MS / 1000,
  });
}

export async function getSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const s = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isActive: true, totpEnabled: true, passwordChangedAt: true, mustChangePassword: true },
      },
    },
  });
  if (!s) return null;
  const now = Date.now();
  if (s.expiresAt.getTime() < now || now - s.lastSeenAt.getTime() > SESSION_IDLE_MS || !s.user.isActive) {
    await prisma.session.delete({ where: { id: s.id } }).catch(() => {});
    return null;
  }
  if (now - s.lastSeenAt.getTime() > 60_000) {
    await prisma.session.update({ where: { id: s.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
  }
  const { isActive: _a, ...user } = s.user;
  return { id: s.id, twoFactorVerified: s.twoFactorVerified, user };
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

/** For admin pages: enforces login → 2FA → password freshness → permission. */
export async function requireAdmin(permission?: Permission): Promise<AdminSession> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!s.twoFactorVerified) redirect("/admin/two-factor");
  if (passwordExpired(s.user)) redirect("/admin/change-password");
  if (permission && !can(s.user.role, permission)) redirect("/admin?denied=1");
  return s;
}

/** For admin API routes: same checks, but throws JSON errors. Call at the top of EVERY admin handler. */
export async function requireApi(permission?: Permission): Promise<SessionUser> {
  const s = await getSession();
  if (!s || !s.twoFactorVerified) throw new HttpError(401, "Not authenticated");
  if (passwordExpired(s.user)) throw new HttpError(403, "Password change required");
  if (permission && !can(s.user.role, permission)) throw new HttpError(403, "You do not have permission for this action");
  return s.user;
}

export function assertRole(actor: { role: Role }, target: Role) {
  if (target === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") throw new HttpError(403, "Only a Super Admin can do this");
}
