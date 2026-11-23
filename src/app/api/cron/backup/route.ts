import { createBackup } from "@/lib/backup";
import { assertCron } from "@/lib/cron";
import { json, route } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 300;

export const GET = route(async (req: Request) => {
  assertCron(req);
  const b = await createBackup("cron");
  return json({ ok: b.status === "SUCCESS", id: b.id, size: b.size });
});
