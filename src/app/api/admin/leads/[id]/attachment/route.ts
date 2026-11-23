import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/http";
import { getObject } from "@/lib/storage";
import { mimeForExt } from "@/lib/uploads";

export const GET = route(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireApi("leads.view");
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id }, select: { attachmentKey: true, attachmentName: true } });
  if (!lead?.attachmentKey) throw new HttpError(404, "No attachment");
  const file = await getObject(lead.attachmentKey);
  if (!file) throw new HttpError(404, "File missing from storage");
  await audit(actor, "lead.attachment.download", { entity: "lead", entityId: id });
  const ext = lead.attachmentKey.split(".").pop() || "";
  return new Response(new Uint8Array(file), {
    headers: {
      "content-type": mimeForExt(ext),
      "content-disposition": `attachment; filename="${(lead.attachmentName || `attachment.${ext}`).replace(/["\r\n]/g, "")}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
});
