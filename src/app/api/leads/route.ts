import { after } from "next/server";
import { attributionToLead, parseAttribution } from "@/lib/attribution";
import { isBot, verifyCaptcha } from "@/lib/captcha";
import { hashIp } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { sendLeadEmails } from "@/lib/email/notifications";
import { env } from "@/lib/env";
import { HttpError, clientIp, json, route, userAgent } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { plain } from "@/lib/sanitize";
import { putObject } from "@/lib/storage";
import { readDocument, storageKey } from "@/lib/uploads";
import { contactSchema, formToObject, quoteSchema } from "@/lib/validation";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  if (Number(req.headers.get("content-length") || 0) > 11 * 1024 * 1024) throw new HttpError(413, "The upload is too large (10 MB max).");
  const ip = await clientIp();
  const ipHash = hashIp(ip);
  await enforceRateLimit(`lead:${ipHash ?? "unknown"}`, 5, 15 * 60);

  const fd = await req.formData();
  const type = fd.get("type") === "quote" ? "QUOTE" : "CONTACT";
  const thanks = `/thank-you?type=${type === "QUOTE" ? "quote" : "contact"}`;
  // Bots get a normal-looking success response so they don't retry, but nothing is stored.
  if (isBot(fd.get("website"), fd.get("startedAt"))) return json({ ok: true, redirect: thanks });

  await verifyCaptcha(fd.get("captcha") as string | null, ip);

  const raw = formToObject(fd);
  const quote = type === "QUOTE" ? quoteSchema.parse(raw) : null;
  const data = quote ?? contactSchema.parse(raw);

  let doc;
  try {
    doc = await readDocument(fd.get("attachment") as File | null, "Attachment");
  } catch (e) {
    if (e instanceof HttpError) throw new HttpError(422, e.message, { attachment: e.message });
    throw e;
  }
  let attachmentKey: string | null = null;
  if (doc) {
    attachmentKey = storageKey("private/leads", doc.ext);
    await putObject(attachmentKey, doc.buffer, doc.mime);
  }

  const details = quote
    ? {
        projectType: quote.projectType,
        platforms: quote.platforms,
        features: quote.features ? plain(quote.features) : null,
        hasDesigns: quote.hasDesigns ?? null,
        preferredContact: quote.preferredContact,
      }
    : undefined;

  const lead = await prisma.lead.create({
    data: {
      type,
      name: plain(data.name),
      company: data.company ? plain(data.company) : null,
      email: data.email,
      phone: data.phone,
      service: data.service,
      budget: data.budget,
      timeline: data.timeline,
      message: plain(data.message),
      details,
      attachmentKey,
      attachmentName: doc?.name,
      attachmentSize: doc?.size,
      consent: true,
      consentAt: new Date(),
      ...attributionToLead(parseAttribution(fd.get("attribution")), new URL(env.appUrl).hostname),
      ipHash,
      userAgent: await userAgent(),
      activities: { create: { type: "created", message: `${type === "QUOTE" ? "Quote request" : "Enquiry"} submitted via website` } },
    },
  });

  after(() => sendLeadEmails(lead).catch((e) => console.error("[lead] email failed", e)));
  return json({ ok: true, redirect: thanks });
});
