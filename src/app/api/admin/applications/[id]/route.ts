import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";
import { deleteObject } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  const actor = await requireApi("applications.view");
  const { id } = await params;
  const { status } = z.object({ status: z.enum(APPLICATION_STATUSES) }).parse(await req.json());
  await prisma.jobApplication.update({ where: { id }, data: { status } }).catch(() => { throw new HttpError(404, "Not found"); });
  await audit(actor, "application.status", { entity: "application", entityId: id, details: { status } });
  return json({ ok: true });
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const actor = await requireApi("applications.view");
  const { id } = await params;
  const a = await prisma.jobApplication.findUnique({ where: { id } });
  if (!a) throw new HttpError(404, "Not found");
  await deleteObject(a.cvKey);
  await prisma.jobApplication.delete({ where: { id } });
  await audit(actor, "application.delete", { entity: "application", entityId: id });
  return json({ ok: true });
});
