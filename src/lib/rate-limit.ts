import { prisma } from "./db";
import { HttpError } from "./http";

/**
 * Fixed-window rate limiter backed by PostgreSQL so it works across serverless
 * instances and multiple containers. Atomic via INSERT … ON CONFLICT.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const resetAt = new Date(Date.now() + windowSeconds * 1000);
  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"`;
  const row = rows[0];
  return { allowed: row.count <= limit, remaining: Math.max(0, limit - row.count), resetAt: row.resetAt };
}

export async function enforceRateLimit(key: string, limit: number, windowSeconds: number) {
  const r = await rateLimit(key, limit, windowSeconds);
  if (!r.allowed) throw new HttpError(429, "Too many requests. Please wait a few minutes and try again.");
}

export async function cleanupRateLimits() {
  await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } });
}
