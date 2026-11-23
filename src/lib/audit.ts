import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { clientIp } from "./http";

export async function audit(
  actor: { id: string; email: string } | null,
  action: string,
  opts: { entity?: string; entityId?: string; details?: Prisma.InputJsonValue } = {},
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: actor?.id,
        userEmail: actor?.email,
        action,
        entity: opts.entity,
        entityId: opts.entityId,
        details: opts.details,
        ipAddress: await clientIp().catch(() => null),
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log", err);
  }
}

/** Returns only the keys whose values changed — keeps audit entries readable. */
export function diff(before: Record<string, unknown>, after: Record<string, unknown>) {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of Object.keys(after)) {
    const a = JSON.stringify(before[k] ?? null);
    const b = JSON.stringify(after[k] ?? null);
    if (a !== b) {
      const long = (v: unknown) => (typeof v === "string" && v.length > 200 ? `${v.slice(0, 200)}…` : v);
      changes[k] = { from: long(before[k]), to: long(after[k]) };
    }
  }
  return changes;
}
