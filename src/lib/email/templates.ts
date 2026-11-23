import { escapeHtml } from "../sanitize";
import { env } from "../env";
import { fullAddress, type SiteSettings } from "../settings";

const NAVY = "#0B1B3A";
const GOLD = "#E3A93B";

/** Branded, table-based HTML layout that renders consistently in Gmail, Outlook and Apple Mail. */
export function layout(s: SiteSettings, opts: { preheader: string; title: string; bodyHtml: string; footerNote?: string }) {
  const c = s.company;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;background:#F4F6FA;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1f2937">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:${NAVY};padding:22px 28px">
<span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.2px">Nuvsera<span style="color:${GOLD}"> Technology</span></span>
</td></tr>
<tr><td style="padding:28px 28px 8px">
<h1 style="margin:0 0 16px;font-size:20px;line-height:28px;color:${NAVY}">${escapeHtml(opts.title)}</h1>
<div style="font-size:15px;line-height:24px">${opts.bodyHtml}</div>
</td></tr>
<tr><td style="padding:20px 28px 28px;font-size:12px;line-height:18px;color:#6b7280;border-top:1px solid #e5e7eb">
${opts.footerNote ? `<p style="margin:0 0 8px">${opts.footerNote}</p>` : ""}
<p style="margin:0"><strong>${escapeHtml(c.legalName)}</strong><br>${escapeHtml(fullAddress(c))}<br>
${escapeHtml(c.phone)} · <a href="mailto:${escapeHtml(c.email)}" style="color:${NAVY}">${escapeHtml(c.email)}</a><br>
CIN ${escapeHtml(c.cin)} · GSTIN ${escapeHtml(c.gstin)}</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function button(href: string, label: string) {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:${GOLD};color:${NAVY};text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px;display:inline-block">${escapeHtml(label)}</a></p>`;
}

export function rows(items: [string, string | null | undefined][]) {
  const r = items
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(String(v)).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;width:100%">${r}</table>`;
}

export function plainFooter(s: SiteSettings) {
  return `\n\n—\n${s.company.legalName}\n${fullAddress(s.company)}\n${s.company.phone} · ${s.company.email}`;
}

export const adminUrl = (p: string) => `${env.appUrl}/admin${p}`;
