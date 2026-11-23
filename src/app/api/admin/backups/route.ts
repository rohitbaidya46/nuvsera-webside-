import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { createBackup } from "@/lib/backup";
import { HttpError, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

export const POST = route(async () => {
  const actor = await requireApi("backups.manage");
  await enforceRateLimit(`backup:${actor.id}`, 5, 3600);
  const b = await createBackup("manual");
  await audit(actor, "backup.create", { entity: "backup", entityId: b.id, details: { status: b.status } });
  if (b.status !== "SUCCESS") throw new HttpError(500, `Backup failed: ${b.error}`);
  return json({ ok: true });
});
