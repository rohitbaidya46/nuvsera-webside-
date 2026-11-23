import { z } from "zod";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";
import { plain } from "@/lib/sanitize";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (req: Request, { params }: Ctx) => {
  const actor = await requireApi("leads.edit");
  const { id } = await params;
  const d = z.object({ dueAt: z.coerce.date(), note: z.string().trim().max(300).optional().nullable() }).parse(await req.json());
  await prisma.lead.update({
    where: { id },
    data: {
      reminders: { create: { dueAt: d.dueAt, note: d.note ? plain(d.note) : null, userId: actor.id } },
      activities: { create: { type: "reminder", message: `Follow-up reminder set for ${d.dueAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`, userId: actor.id } },
    },
  });
  return json({ ok: true });
});

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireApi("leads.edit");
  const { id } = await params;
  const d = z.object({ reminderId: z.string().max(40), done: z.boolean() }).parse(await req.json());
  const r = await prisma.leadReminder.updateMany({ where: { id: d.reminderId, leadId: id }, data: { done: d.done } });
  if (!r.count) throw new HttpError(404, "Reminder not found");
  return json({ ok: true });
});
