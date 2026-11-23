import { cache } from "react";
import { z } from "zod";
import { prisma } from "./db";

export const statSchema = z.object({
  label: z.string().trim().min(1).max(60),
  value: z.string().trim().min(1).max(20),
});

export const settingsSchema = z.object({
  company: z.object({
    legalName: z.string().trim().min(1).max(200),
    brandName: z.string().trim().min(1).max(100),
    tagline: z.string().trim().max(200),
    email: z.string().trim().email(),
    phone: z.string().trim().max(30),
    whatsapp: z.string().trim().regex(/^\d{10,15}$/, "Digits only incl. country code, e.g. 917872994746"),
    addressLine1: z.string().trim().max(200),
    addressLine2: z.string().trim().max(200),
    city: z.string().trim().max(80),
    state: z.string().trim().max(80),
    postalCode: z.string().trim().max(12),
    country: z.string().trim().max(80),
    businessHours: z.string().trim().max(120),
    cin: z.string().trim().max(30),
    gstin: z.string().trim().max(20),
    udyam: z.string().trim().max(30),
    udyamCategory: z.string().trim().max(40),
    logoUrl: z.string().trim().max(500),
    mapUrl: z.string().trim().max(500),
  }),
  social: z.object({
    linkedin: z.string().trim().max(300),
    x: z.string().trim().max(300),
    facebook: z.string().trim().max(300),
    instagram: z.string().trim().max(300),
    youtube: z.string().trim().max(300),
    github: z.string().trim().max(300),
  }),
  hero: z.object({
    headline: z.string().trim().min(1).max(140),
    rotating: z.array(z.string().trim().min(1).max(140)).max(5),
    subheadline: z.string().trim().min(1).max(300),
  }),
  tracking: z.object({
    ga4Id: z.string().trim().regex(/^(G-[A-Z0-9]+)?$/, "Format: G-XXXXXXX"),
    googleAdsId: z.string().trim().regex(/^(AW-\d+)?$/, "Format: AW-123456789"),
    googleAdsLeadLabel: z.string().trim().max(60),
    linkedinPartnerId: z.string().trim().regex(/^\d*$/, "Digits only"),
    linkedinConversionId: z.string().trim().regex(/^\d*$/, "Digits only"),
  }),
  email: z.object({
    adminRecipients: z.array(z.string().trim().email()).max(10),
    fromName: z.string().trim().max(100),
    fromEmail: z.string().trim().email().or(z.literal("")),
    replyTo: z.string().trim().email().or(z.literal("")),
    smtpHost: z.string().trim().max(200),
    smtpPort: z.coerce.number().int().min(1).max(65535),
    smtpSecure: z.boolean(),
    smtpUser: z.string().trim().max(200),
    smtpPassEnc: z.string().max(1000), // encrypted; never returned to the browser
  }),
  stats: z.array(statSchema).max(6),
});

export type SiteSettings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: SiteSettings = {
  company: {
    legalName: "Nuvsera Technology Private Limited",
    brandName: "Nuvsera Technology",
    tagline: "Software, blockchain and cybersecurity engineering from Kolkata, India.",
    email: "info@nuvseratechnology.com",
    phone: "+91 78729 94746",
    whatsapp: "917872994746",
    addressLine1: "706, 7th Floor, OM Tower",
    addressLine2: "32 Chowringhee Road, Park Street",
    city: "Kolkata",
    state: "West Bengal",
    postalCode: "700071",
    country: "India",
    businessHours: "Monday – Saturday, 10:00 AM – 7:00 PM IST",
    cin: "U62013WB2025PTC283873",
    gstin: "19AAKCN9781A1Z2",
    udyam: "UDYAM-WB-10-0197639",
    udyamCategory: "MSME – Micro",
    logoUrl: "",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=OM+Tower+32+Chowringhee+Road+Kolkata+700071",
  },
  social: { linkedin: "", x: "", facebook: "", instagram: "", youtube: "", github: "" },
  hero: {
    headline: "Modernise Your Business with Custom Software Solutions",
    rotating: ["Build the Exchange Platform of the Future on Blockchain"],
    subheadline:
      "We design, build and secure software that runs your business — from custom applications and mobile apps to blockchain platforms and independent cybersecurity audits.",
  },
  tracking: { ga4Id: "", googleAdsId: "", googleAdsLeadLabel: "", linkedinPartnerId: "", linkedinConversionId: "" },
  email: {
    adminRecipients: ["info@nuvseratechnology.com"],
    fromName: "Nuvsera Technology",
    fromEmail: "",
    replyTo: "info@nuvseratechnology.com",
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPassEnc: "",
  },
  stats: [],
};

function merge(stored: unknown): SiteSettings {
  const s = (stored ?? {}) as Partial<Record<keyof SiteSettings, unknown>>;
  const out = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const def = DEFAULT_SETTINGS[k];
    const val = s[k];
    if (val === undefined || val === null) continue;
    out[k] = Array.isArray(def) ? val : { ...(def as object), ...(val as object) };
  }
  const parsed = settingsSchema.safeParse(out);
  return parsed.success ? parsed.data : DEFAULT_SETTINGS;
}

/** Cached per request. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "site" } });
    return merge(row?.value);
  } catch (err) {
    console.error("[settings] falling back to defaults", err);
    return DEFAULT_SETTINGS;
  }
});

export async function saveSettings(next: SiteSettings) {
  await prisma.setting.upsert({
    where: { key: "site" },
    create: { key: "site", value: next },
    update: { value: next },
  });
}

/** Strip secrets before sending settings to a browser. */
export function publicSettings(s: SiteSettings) {
  return { ...s, email: { ...s.email, smtpPassEnc: s.email.smtpPassEnc ? "••••••••" : "" } };
}

export function fullAddress(c: SiteSettings["company"]) {
  return [c.addressLine1, c.addressLine2, `${c.city} – ${c.postalCode}`, c.state, c.country].filter(Boolean).join(", ");
}
