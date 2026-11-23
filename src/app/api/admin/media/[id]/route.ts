import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";
import { plain } from "@/lib/sanitize";
import { deleteObject } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  const actor = await requireApi("media.manage");
  const { id } = await params;
  const { alt } = z.object({ alt: z.string().max(250) }).parse(await req.json());
  await prisma.media.update({ where: { id }, data: { alt: plain(alt) } }).catch(() => { throw new HttpError(404, "Not found"); });
  await audit(actor, "media.update", { entity: "media", entityId: id });
  return json({ ok: true });
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const actor = await requireApi("media.manage");
  const { id } = await params;
  const m = await prisma.media.findUnique({ where: { id } });
  if (!m) throw new HttpError(404, "Not found");
  await deleteObject(m.key);
  await prisma.media.delete({ where: { id } });
  await audit(actor, "media.delete", { entity: "media", entityId: id, details: { filename: m.filename } });
  return json({ ok: true });
});
