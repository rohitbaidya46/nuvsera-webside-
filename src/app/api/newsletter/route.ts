import { after } from "next/server";
import { isBot } from "@/lib/captcha";
import { hashIp, randomToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { sendNewsletterConfirmation } from "@/lib/email/notifications";
import { clientIp, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { formToObject, newsletterSchema } from "@/lib/validation";

export const POST = route(async (req: Request) => {
  await enforceRateLimit(`nl:${hashIp(await clientIp()) ?? "unknown"}`, 5, 3600);
  const fd = await req.formData();
  if (isBot(fd.get("website"))) return json({ ok: true });
  const { email } = newsletterSchema.parse(formToObject(fd));
  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing?.status === "ACTIVE") return json({ ok: true }); // don't reveal subscription status
  const token = randomToken(24);
  const sub = existing
    ? await prisma.subscriber.update({ where: { email }, data: { status: "PENDING", unsubscribeToken: token, consent: true } })
    : await prisma.subscriber.create({ data: { email, status: "PENDING", consent: true, source: "footer", unsubscribeToken: token } });
  after(() => sendNewsletterConfirmation(sub.email, token).catch(console.error));
  return json({ ok: true });
});
