import { audit } from "@/lib/audit";
import { delegate, prismaError, resourceSchema, toPrismaData } from "@/lib/admin/resource-server";
import { getResource } from "@/lib/admin/resources";
import { requireApi } from "@/lib/auth";
import { HttpError, json, route } from "@/lib/http";

export const POST = route(async (req: Request, { params }: { params: Promise<{ resource: string }> }) => {
  const r = getResource((await params).resource);
  if (!r) throw new HttpError(404, "Unknown content type");
  const actor = await requireApi(r.permission);
  if (r.canCreate === false) throw new HttpError(405, `${r.label} cannot be created here`);
  const values = resourceSchema(r).parse(await req.json());
  const rec = await delegate(r).create({ data: toPrismaData(r, values, "create") }).catch(prismaError);
  await audit(actor, `${r.key}.create`, { entity: r.model, entityId: String(rec.id), details: { title: String(values[r.titleField] ?? "") } });
  return json({ ok: true, id: rec.id });
});
