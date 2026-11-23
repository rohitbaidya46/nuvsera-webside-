import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/http";
import { getObject } from "@/lib/storage";

/** Downloads the encrypted backup. Decrypt with `npm run backup:decrypt -- <file>` (needs ENCRYPTION_KEY). */
export const GET = route(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireApi("backups.manage");
  const { id } = await params;
  const b = await prisma.backup.findUnique({ where: { id } });
  if (!b?.key) throw new HttpError(404, "Backup not found");
  const file = await getObject(b.key);
  if (!file) throw new HttpError(404, "Backup file missing from storage");
  await audit(actor, "backup.download", { entity: "backup", entityId: id });
  return new Response(new Uint8Array(file), {
    headers: { "content-type": "application/octet-stream", "content-disposition": `attachment; filename="${b.key.split("/").pop()}"`, "cache-control": "private, no-store" },
  });
});
