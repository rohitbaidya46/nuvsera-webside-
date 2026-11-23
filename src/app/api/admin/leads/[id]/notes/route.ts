import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { json, route } from "@/lib/http";
import { plain } from "@/lib/sanitize";

export const POST = route(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireApi("leads.edit");
  const { id } = await params;
  const { body } = z.object({ body: z.string().trim().min(1).max(5000) }).parse(await req.json());
  await prisma.lead.update({
    where: { id },
    data: { notes: { create: { body: plain(body), authorId: actor.id } }, activities: { create: { type: "note", message: "Note added", userId: actor.id } } },
  });
  await audit(actor, "lead.note", { entity: "lead", entityId: id });
  return json({ ok: true });
});
