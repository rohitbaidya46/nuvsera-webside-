import { prisma } from "@/lib/db";
import { assertCron } from "@/lib/cron";
import { sendMail } from "@/lib/email";
import { adminUrl, layout } from "@/lib/email/templates";
import { json, route } from "@/lib/http";
import { cleanupRateLimits } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/sanitize";
import { getSettings } from "@/lib/settings";

/** Runs every 15 minutes: emails follow-up reminders that are due, and cleans up expired security records. */
export const GET = route(async (req: Request) => {
  assertCron(req);
  const due = await prisma.leadReminder.findMany({
    where: { done: false, notifiedAt: null, dueAt: { lte: new Date() } },
    include: { lead: { select: { id: true, name: true, company: true } }, user: { select: { email: true, isActive: true } } },
    take: 200,
  });
  const s = await getSettings();
  for (const r of due) {
    const to = r.user?.isActive ? r.user.email : null;
    if (to) {
      await sendMail({
        to,
        subject: `Follow-up due: ${r.lead.name}${r.lead.company ? ` (${r.lead.company})` : ""}`,
        html: layout(s, { preheader: "Lead follow-up reminder", title: "Follow-up reminder", bodyHtml: `<p>${escapeHtml(r.note || "Follow up with this lead.")}</p><p><a href="${adminUrl(`/leads/${r.lead.id}`)}">Open ${escapeHtml(r.lead.name)} in the admin panel</a></p>` }),
        text: `Follow-up due for ${r.lead.name}: ${r.note || ""}\n${adminUrl(`/leads/${r.lead.id}`)}`,
      });
    }
    await prisma.leadReminder.update({ where: { id: r.id }, data: { notifiedAt: new Date() } });
  }
  await Promise.all([
    cleanupRateLimits(),
    prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
    prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);
  return json({ ok: true, reminders: due.length });
});
