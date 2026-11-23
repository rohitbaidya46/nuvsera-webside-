import type { JobApplication, Lead } from "@prisma/client";
import { escapeHtml } from "../sanitize";
import { env } from "../env";
import { getSettings } from "../settings";
import { prisma } from "../db";
import { adminRecipients, sendMail } from "./index";
import { adminUrl, button, layout, plainFooter, rows } from "./templates";

async function serviceTitle(slug?: string | null) {
  if (!slug) return null;
  const s = await prisma.service.findUnique({ where: { slug }, select: { title: true } });
  return s?.title ?? slug;
}

export async function sendLeadEmails(lead: Lead) {
  const s = await getSettings();
  const svc = await serviceTitle(lead.service);
  const kind = lead.type === "QUOTE" ? "quote request" : "enquiry";
  const details = (lead.details ?? {}) as Record<string, unknown>;
  const info: [string, string | null | undefined][] = [
    ["Name", lead.name],
    ["Company", lead.company],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Service", svc],
    ["Budget", lead.budget],
    ["Timeline", lead.timeline],
    ["Project type", details.projectType as string],
    ["Platforms", Array.isArray(details.platforms) ? (details.platforms as string[]).join(", ") : null],
    ["Preferred contact", details.preferredContact as string],
    ["Message", lead.message],
    ["Features", details.features as string],
  ];

  // 1) Admin notification
  await sendMail({
    to: await adminRecipients(),
    replyTo: lead.email,
    subject: `New ${kind}: ${lead.name}${lead.company ? ` (${lead.company})` : ""} — ${svc ?? "General"}`,
    html: layout(s, {
      preheader: `New ${kind} from ${lead.name}`,
      title: `New ${kind} received`,
      bodyHtml:
        rows([...info, ["Source", lead.source], ["Page", lead.sourcePage], ["Campaign", lead.utmCampaign], ["Attachment", lead.attachmentName]]) +
        button(adminUrl(`/leads/${lead.id}`), "Open in admin panel"),
    }),
    text: `New ${kind}\n\n${info.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nSource: ${lead.source}\nOpen: ${adminUrl(`/leads/${lead.id}`)}`,
  });

  // 2) Visitor auto-reply
  const first = lead.name.split(" ")[0];
  await sendMail({
    to: lead.email,
    replyTo: s.email.replyTo || s.company.email,
    subject: `Thank you for contacting ${s.company.brandName}`,
    html: layout(s, {
      preheader: "We have received your message and will reply within one business day.",
      title: `Thank you, ${first}`,
      bodyHtml: `<p>Thank you for your ${escapeHtml(kind)}${svc ? ` about <strong>${escapeHtml(svc)}</strong>` : ""}. A member of our team will review it and get back to you within one business day.</p>
<p>If your request is urgent, call or WhatsApp us on <a href="tel:${escapeHtml(s.company.phone.replace(/\s/g, ""))}">${escapeHtml(s.company.phone)}</a>.</p>
<p style="color:#6b7280;font-size:13px">For your records, here is a summary of what you sent us:</p>${rows(info.filter(([k]) => !["Name", "Email"].includes(k)))}
<p>Warm regards,<br>Team ${escapeHtml(s.company.brandName)}</p>`,
      footerNote: "You are receiving this email because you submitted a form on our website. We will only use your details to respond to your enquiry.",
    }),
    text: `Hi ${first},\n\nThank you for your ${kind}${svc ? ` about ${svc}` : ""}. We will get back to you within one business day.\nUrgent? Call or WhatsApp ${s.company.phone}.\n\nTeam ${s.company.brandName}${plainFooter(s)}`,
  });
}

export async function sendApplicationEmails(app: JobApplication, jobTitle: string | null) {
  const s = await getSettings();
  const role = jobTitle ?? "General application";
  await sendMail({
    to: await adminRecipients(),
    replyTo: app.email,
    subject: `New job application: ${app.name} — ${role}`,
    html: layout(s, {
      preheader: `${app.name} applied for ${role}`,
      title: "New job application",
      bodyHtml: rows([["Role", role], ["Name", app.name], ["Email", app.email], ["Phone", app.phone], ["Location", app.location], ["Experience", app.experience], ["LinkedIn", app.linkedin]]) + button(adminUrl(`/applications`), "Review in admin panel"),
    }),
    text: `New application for ${role}\n${app.name} <${app.email}> ${app.phone}\n${adminUrl("/applications")}`,
  });
  await sendMail({
    to: app.email,
    subject: `We received your application — ${s.company.brandName}`,
    html: layout(s, {
      preheader: "Thank you for applying.",
      title: `Thank you for applying, ${app.name.split(" ")[0]}`,
      bodyHtml: `<p>We have received your application for <strong>${escapeHtml(role)}</strong>. Our team reviews every application carefully; if your profile matches, we will contact you to arrange a conversation.</p><p>Best wishes,<br>Hiring Team, ${escapeHtml(s.company.brandName)}</p>`,
    }),
    text: `Thank you for applying for ${role}. We will be in touch if your profile matches.${plainFooter(s)}`,
  });
}

export async function sendNewsletterConfirmation(email: string, token: string) {
  const s = await getSettings();
  const confirm = `${env.appUrl}/newsletter/confirm?token=${token}`;
  await sendMail({
    to: email,
    subject: `Please confirm your subscription — ${s.company.brandName}`,
    html: layout(s, {
      preheader: "One click to confirm your subscription.",
      title: "Confirm your subscription",
      bodyHtml: `<p>Please confirm that you would like to receive occasional insights from ${escapeHtml(s.company.brandName)}.</p>${button(confirm, "Confirm subscription")}<p style="font-size:13px;color:#6b7280">If you did not request this, simply ignore this email — you will not be subscribed.</p>`,
    }),
    text: `Confirm your subscription: ${confirm}\n\nIf you did not request this, ignore this email.${plainFooter(s)}`,
  });
}
