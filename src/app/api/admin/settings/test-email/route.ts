import { requireApi } from "@/lib/auth";
import { sendMail, verifySmtp } from "@/lib/email";
import { layout } from "@/lib/email/templates";
import { HttpError, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";

export const POST = route(async () => {
  const actor = await requireApi("settings.manage");
  await enforceRateLimit(`test-email:${actor.id}`, 5, 600);
  try {
    await verifySmtp();
  } catch (e) {
    throw new HttpError(502, `SMTP connection failed: ${e instanceof Error ? e.message : "unknown error"}`);
  }
  const s = await getSettings();
  const r = await sendMail({ to: actor.email, subject: "Test email from Nuvsera Admin", html: layout(s, { preheader: "SMTP test", title: "Email is working", bodyHtml: "<p>This test confirms your SMTP settings are correct.</p>" }), text: "Your SMTP settings are working." });
  if (!r.ok) throw new HttpError(502, r.error || "Send failed");
  return json({ ok: true, message: `Test email sent to ${actor.email}` });
});
