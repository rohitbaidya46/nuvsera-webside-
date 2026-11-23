import { z } from "zod";

const s = (max = 300) => z.string().trim().max(max).optional().nullable().catch(null);

export const attributionSchema = z
  .object({
    landingPage: s(500),
    referrer: s(500),
    sourcePage: s(500),
    utm_source: s(),
    utm_medium: s(),
    utm_campaign: s(),
    utm_term: s(),
    utm_content: s(),
    gclid: s(),
    gbraid: s(),
    wbraid: s(),
    li_fat_id: s(),
  })
  .partial()
  .catch({});

export type Attribution = z.infer<typeof attributionSchema>;

export function parseAttribution(raw: unknown): Attribution {
  if (typeof raw !== "string" || raw.length > 5000) return {};
  try {
    return attributionSchema.parse(JSON.parse(raw));
  } catch {
    return {};
  }
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|baidu)\./i;
const SOCIAL = /(^|\.)(linkedin|lnkd|facebook|fb|instagram|t\.co|twitter|x\.com|youtube|reddit|whatsapp)\b/i;

/** Classifies a lead into a marketing channel. */
export function deriveSource(a: Attribution, ownHost?: string): string {
  if (a.gclid || a.gbraid || a.wbraid) return "google-ads";
  if (a.li_fat_id) return "linkedin-ads";
  if (a.utm_source) {
    const medium = (a.utm_medium || "").toLowerCase();
    const paid = ["cpc", "ppc", "paid", "paidsocial", "paid_social", "display"].includes(medium);
    return `${paid ? "paid" : "campaign"}:${a.utm_source.toLowerCase().slice(0, 40)}`;
  }
  if (a.referrer) {
    try {
      const host = new URL(a.referrer).hostname;
      if (ownHost && host.endsWith(ownHost)) return "direct";
      if (SEARCH.test(host)) return "organic-search";
      if (SOCIAL.test(host)) return "social";
      return "referral";
    } catch {
      /* ignore */
    }
  }
  return "direct";
}

export function attributionToLead(a: Attribution, ownHost?: string) {
  return {
    source: deriveSource(a, ownHost),
    sourcePage: a.sourcePage ?? null,
    landingPage: a.landingPage ?? null,
    referrer: a.referrer ?? null,
    utmSource: a.utm_source ?? null,
    utmMedium: a.utm_medium ?? null,
    utmCampaign: a.utm_campaign ?? null,
    utmTerm: a.utm_term ?? null,
    utmContent: a.utm_content ?? null,
    gclid: a.gclid ?? null,
    gbraid: a.gbraid ?? null,
    wbraid: a.wbraid ?? null,
    liFatId: a.li_fat_id ?? null,
  };
}
