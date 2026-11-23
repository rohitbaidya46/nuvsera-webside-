import { z } from "zod";
import { BUDGET_OPTIONS, SERVICE_SLUGS, TIMELINE_OPTIONS } from "./constants";

const name = z.string().trim().min(2, "Please enter your name").max(100);
const email = z.string().trim().toLowerCase().email("Please enter a valid email address").max(200);
const phone = z
  .string()
  .trim()
  .max(20)
  .regex(/^\+?[0-9 ()-]{7,20}$/, "Please enter a valid phone number");
const optional = (max: number) => z.string().trim().max(max).optional().transform((v) => v || undefined);

export const consentField = z.preprocess(
  (v) => v === "on" || v === "true" || v === true,
  z.literal(true, { errorMap: () => ({ message: "Please accept the Privacy Policy to continue" }) }),
);

export const contactSchema = z.object({
  name,
  company: optional(150),
  email,
  phone,
  service: z.enum(SERVICE_SLUGS, { errorMap: () => ({ message: "Please choose a service" }) }),
  budget: z.enum(BUDGET_OPTIONS, { errorMap: () => ({ message: "Please choose a budget range" }) }),
  timeline: z.enum(TIMELINE_OPTIONS, { errorMap: () => ({ message: "Please choose a timeline" }) }),
  message: z.string().trim().min(10, "Please tell us a little about your project (10+ characters)").max(5000),
  consent: consentField,
});

export const quoteSchema = contactSchema.extend({
  projectType: z.enum(["new", "existing", "audit", "consulting"], { errorMap: () => ({ message: "Please choose an option" }) }),
  platforms: z.array(z.enum(["web", "android", "ios", "desktop", "backend", "not-sure"])).max(6).default([]),
  features: optional(2000),
  hasDesigns: z.enum(["yes", "partial", "no"]).optional(),
  preferredContact: z.enum(["email", "phone", "whatsapp"]).default("email"),
});

export const newsletterSchema = z.object({ email, consent: consentField });

export const applicationSchema = z.object({
  jobId: z.string().trim().max(40).optional().transform((v) => v || undefined),
  name,
  email,
  phone,
  location: optional(120),
  experience: optional(60),
  linkedin: z.string().trim().max(300).url("Please enter a valid URL").optional().or(z.literal("")).transform((v) => v || undefined),
  portfolio: z.string().trim().max(300).url("Please enter a valid URL").optional().or(z.literal("")).transform((v) => v || undefined),
  coverLetter: optional(5000),
  consent: consentField,
});

export function formToObject(fd: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string") continue;
    if (k.endsWith("[]")) {
      const key = k.slice(0, -2);
      (obj[key] ??= [] as string[]) as string[];
      (obj[key] as string[]).push(v);
    } else obj[k] = v;
  }
  return obj;
}
