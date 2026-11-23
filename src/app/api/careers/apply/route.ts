import { after } from "next/server";
import { isBot, verifyCaptcha } from "@/lib/captcha";
import { hashIp } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { sendApplicationEmails } from "@/lib/email/notifications";
import { HttpError, clientIp, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { plain } from "@/lib/sanitize";
import { putObject } from "@/lib/storage";
import { readDocument, storageKey } from "@/lib/uploads";
import { applicationSchema, formToObject } from "@/lib/validation";

export const runtime = "nodejs";

export const POST = route(async (req: Request) => {
  if (Number(req.headers.get("content-length") || 0) > 11 * 1024 * 1024) throw new HttpError(413, "The upload is too large (10 MB max).");
  const ip = await clientIp();
  const ipHash = hashIp(ip);
  await enforceRateLimit(`apply:${ipHash ?? "unknown"}`, 5, 3600);
  const fd = await req.formData();
  if (isBot(fd.get("website"), fd.get("startedAt"))) return json({ ok: true, redirect: "/thank-you?type=application" });
  await verifyCaptcha(fd.get("captcha") as string | null, ip);
  const data = applicationSchema.parse(formToObject(fd));

  let doc;
  try {
    doc = await readDocument(fd.get("cv") as File | null, "CV");
  } catch (e) {
    if (e instanceof HttpError) throw new HttpError(422, e.message, { cv: e.message });
    throw e;
  }
  if (!doc) throw new HttpError(422, "Please attach your CV.", { cv: "Please attach your CV." });

  const job = data.jobId ? await prisma.job.findFirst({ where: { id: data.jobId, published: true } }) : null;
  const cvKey = storageKey("private/cv", doc.ext);
  await putObject(cvKey, doc.buffer, doc.mime);

  const app = await prisma.jobApplication.create({
    data: {
      jobId: job?.id,
      name: plain(data.name),
      email: data.email,
      phone: data.phone,
      location: data.location && plain(data.location),
      experience: data.experience && plain(data.experience),
      linkedin: data.linkedin,
      portfolio: data.portfolio,
      coverLetter: data.coverLetter && plain(data.coverLetter),
      cvKey,
      cvName: doc.name,
      cvSize: doc.size,
      consent: true,
      ipHash,
    },
  });
  after(() => sendApplicationEmails(app, job?.title ?? null).catch(console.error));
  return json({ ok: true, redirect: "/thank-you?type=application" });
});
