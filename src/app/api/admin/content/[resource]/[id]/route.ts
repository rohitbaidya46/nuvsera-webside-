import type { Prisma } from "@prisma/client";
import { audit, diff } from "@/lib/audit";
import { delegate, prismaError, resourceSchema, toPrismaData } from "@/lib/admin/resource-server";
import { getResource } from "@/lib/admin/resources";
import { requireApi } from "@/lib/auth";
import { HttpError, json, route } from "@/lib/http";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function load(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const r = getResource(resource);
  if (!r) throw new HttpError(404, "Unknown content type");
  const actor = await requireApi(r.permission);
  const existing = await delegate(r).findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, "Not found");
  return { r, id, actor, existing };
}

export const PATCH = route(async (req: Request, ctx: Ctx) => {
  const { r, id, actor, existing } = await load(ctx);
  const values = resourceSchema(r).parse(await req.json());
  await delegate(r).update({ where: { id }, data: toPrismaData(r, values, "update") }).catch(prismaError);
  await audit(actor, `${r.key}.update`, { entity: r.model, entityId: id, details: diff(existing, values) as Prisma.InputJsonValue });
  return json({ ok: true, id });
});

export const DELETE = route(async (_req: Request, ctx: Ctx) => {
  const { r, id, actor, existing } = await load(ctx);
  if (r.canDelete === false) throw new HttpError(405, `${r.label} cannot be deleted`);
  await delegate(r).delete({ where: { id } }).catch(prismaError);
  await audit(actor, `${r.key}.delete`, { entity: r.model, entityId: id, details: { title: String(existing[r.titleField] ?? "") } });
  return json({ ok: true });
});
