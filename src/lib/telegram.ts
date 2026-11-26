import "server-only";
import type { JobApplication, Lead } from "@prisma/client";
import { prisma } from "./db";
import { adminUrl } from "./email/templates";

/**
 * Optional Telegram alerts for new leads and job applications.
 * Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to turn them on; with either missing this does nothing.
 * TELEGRAM_CHAT_ID can hold several comma-separated chat IDs (people, groups or channels).
 */
function config() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
  const chatIds = (process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return token && chatIds.length ? { token, chatIds } : null;
}

export function telegramEnabled() {
  return config() !== null;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function lines(info: [string, string | null | undefined][]) {
  return info
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const value = String(v);
      return `<b>${esc(k)}:</b> ${esc(value.length > 600 ? `${value.slice(0, 600)}…` : value)}`;
    })
    .join("\n");
}

/** Sends an HTML-formatted message to every configured chat. Never throws. */
export async function sendTelegram(html: string) {
  const cfg = config();
  if (!cfg) return;
  await Promise.all(
    cfg.chatIds.map(async (chatId) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) console.error(`[telegram] send to ${chatId} failed: ${res.status} ${await res.text().catch(() => "")}`);
      } catch (e) {
        console.error(`[telegram] send to ${chatId} failed`, e);
      }
    }),
  );
}

export async function notifyLeadTelegram(lead: Lead) {
  if (!telegramEnabled()) return;
  const svc = lead.service
    ? (await prisma.service.findUnique({ where: { slug: lead.service }, select: { title: true } }))?.title ?? lead.service
    : null;
  const kind = lead.type === "QUOTE" ? "quote request" : "enquiry";
  const body = lines([
    ["Name", lead.name],
    ["Company", lead.company],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Service", svc],
    ["Budget", lead.budget],
    ["Timeline", lead.timeline],
    ["Message", lead.message],
    ["Source", lead.source],
  ]);
  await sendTelegram(`🔔 <b>New ${kind}</b>\n\n${body}\n\n<a href="${esc(adminUrl(`/leads/${lead.id}`))}">Open in admin panel</a>`);
}

export async function notifyApplicationTelegram(app: JobApplication, jobTitle: string | null) {
  if (!telegramEnabled()) return;
  const body = lines([
    ["Role", jobTitle ?? "General application"],
    ["Name", app.name],
    ["Email", app.email],
    ["Phone", app.phone],
    ["Location", app.location],
    ["Experience", app.experience],
  ]);
  await sendTelegram(`💼 <b>New job application</b>\n\n${body}\n\n<a href="${esc(adminUrl("/applications"))}">Review in admin panel</a>`);
}
