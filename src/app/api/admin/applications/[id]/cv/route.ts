import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, route } from "@/lib/http";
import { getObject } from "@/lib/storage";
import { mimeForExt } from "@/lib/uploads";

export const GET = route(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireApi("applications.view");
  const { id } = await params;
  const a = await prisma.jobApplication.findUnique({ where: { id }, select: { cvKey: true, cvName: true } });
  if (!a) throw new HttpError(404, "Not found");
  const file = await getObject(a.cvKey);
  if (!file) throw new HttpError(404, "File missing from storage");
  await audit(actor, "application.cv.download", { entity: "application", entityId: id });
  const ext = a.cvKey.split(".").pop() || "";
  return new Response(new Uint8Array(file), {
    headers: {
      "content-type": mimeForExt(ext),
      "content-disposition": `attachment; filename="${a.cvName.replace(/["\r\n]/g, "")}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
});
