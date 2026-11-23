import { z } from "zod";
import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { layout, plainFooter } from "@/lib/email/templates";
import { HttpError, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { escapeHtml, plain } from "@/lib/sanitize";
import { getSettings } from "@/lib/settings";

export const POST = route(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireApi("leads.edit");
  await enforceRateLimit(`lead-email:${actor.id}`, 60, 3600);
  const { id } = await params;
  const d = z.object({ subject: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(10000) }).parse(await req.json());
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new HttpError(404, "Lead not found");
  const s = await getSettings();
  const subject = plain(d.subject);
  const body = plain(d.body);
  const result = await sendMail({
    to: lead.email,
    replyTo: actor.email,
    subject,
    html: layout(s, { preheader: subject, title: subject, bodyHtml: `<div style="white-space:pre-wrap">${escapeHtml(body)}</div><p style="margin-top:16px">${escapeHtml(actor.name)}<br>${escapeHtml(s.company.brandName)}</p>` }),
    text: `${body}\n\n${actor.name}\n${s.company.brandName}${plainFooter(s)}`,
  });
  await prisma.lead.update({
    where: { id },
    data: {
      emails: { create: { subject, body, senderId: actor.id, status: result.ok ? "SENT" : "FAILED", error: result.error } },
      activities: { create: { type: "email", message: result.ok ? `Email sent: “${subject}”` : `Email failed: ${result.error}`, userId: actor.id } },
      ...(result.ok && lead.status === "NEW" ? { status: "CONTACTED" } : {}),
    },
  });
  await audit(actor, "lead.email", { entity: "lead", entityId: id, details: { subject, ok: result.ok } });
  if (!result.ok) throw new HttpError(502, `Email could not be sent: ${result.error}`);
  return json({ ok: true });
});
