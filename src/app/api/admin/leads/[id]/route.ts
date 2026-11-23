import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";
import { deleteObject } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(LEAD_STATUSES).optional(), assignedToId: z.string().max(40).nullable().optional() });

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  const actor = await requireApi("leads.edit");
  const { id } = await params;
  const body = schema.parse(await req.json());
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new HttpError(404, "Lead not found");
  const activities: { type: string; message: string; userId: string }[] = [];
  const data: Record<string, unknown> = {};
  if (body.status && body.status !== lead.status) {
    data.status = body.status;
    data.closedAt = body.status === "WON" || body.status === "LOST" ? new Date() : null;
    activities.push({ type: "status", message: `Status changed: ${LEAD_STATUS_LABELS[lead.status]} → ${LEAD_STATUS_LABELS[body.status]}`, userId: actor.id });
  }
  if (body.assignedToId !== undefined && body.assignedToId !== lead.assignedToId) {
    let name = "nobody";
    if (body.assignedToId) {
      const u = await prisma.user.findFirst({ where: { id: body.assignedToId, isActive: true, role: { in: ["SUPER_ADMIN", "ADMIN", "SALES"] } } });
      if (!u) throw new HttpError(422, "Invalid team member");
      name = u.name;
    }
    data.assignedToId = body.assignedToId;
    activities.push({ type: "assigned", message: `Assigned to ${name}`, userId: actor.id });
  }
  if (!activities.length) return json({ ok: true });
  await prisma.lead.update({ where: { id }, data: { ...data, activities: { create: activities } } });
  await audit(actor, "lead.update", { entity: "lead", entityId: id, details: data as Record<string, string> });
  return json({ ok: true });
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const actor = await requireApi("leads.delete");
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new HttpError(404, "Lead not found");
  if (lead.attachmentKey) await deleteObject(lead.attachmentKey);
  await prisma.lead.delete({ where: { id } });
  await audit(actor, "lead.delete", { entity: "lead", entityId: id, details: { email: lead.email, name: lead.name } });
  return json({ ok: true });
});
