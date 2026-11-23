import nodemailer, { type Transporter } from "nodemailer";
import { decrypt } from "../crypto";
import { getSettings, type SiteSettings } from "../settings";

/**
 * Transactional email over SMTP — works with Amazon SES (SMTP interface), Brevo, Zoho, Google Workspace etc.
 * Connection details come from Admin → Settings → Email, falling back to SMTP_* environment variables.
 */
type Mail = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string };

function smtpConfig(s: SiteSettings) {
  const e = s.email;
  let pass = process.env.SMTP_PASSWORD || "";
  if (e.smtpPassEnc) {
    try {
      pass = decrypt(e.smtpPassEnc);
    } catch {
      console.error("[email] could not decrypt stored SMTP password");
    }
  }
  return {
    host: e.smtpHost || process.env.SMTP_HOST || "",
    port: e.smtpHost ? e.smtpPort : Number(process.env.SMTP_PORT || 587),
    secure: e.smtpHost ? e.smtpSecure : process.env.SMTP_SECURE === "true",
    user: e.smtpUser || process.env.SMTP_USER || "",
    pass,
    from: e.fromEmail || process.env.SMTP_FROM || "",
    fromName: e.fromName || s.company.brandName,
  };
}

let cached: { key: string; t: Transporter } | null = null;

async function transporter() {
  const s = await getSettings();
  const c = smtpConfig(s);
  if (!c.host || !c.from) return { t: null, c };
  const key = JSON.stringify([c.host, c.port, c.secure, c.user, c.pass]);
  if (!cached || cached.key !== key) {
    cached = {
      key,
      t: nodemailer.createTransport({
        host: c.host,
        port: c.port,
        secure: c.secure,
        auth: c.user ? { user: c.user, pass: c.pass } : undefined,
        requireTLS: !c.secure,
      }),
    };
  }
  return { t: cached.t, c };
}

export async function sendMail(mail: Mail): Promise<{ ok: boolean; error?: string }> {
  const { t, c } = await transporter();
  if (!t) {
    console.warn(`[email] SMTP not configured — email "${mail.subject}" to ${mail.to} was NOT sent.`);
    if (process.env.NODE_ENV !== "production") console.info(mail.text);
    return { ok: false, error: "SMTP is not configured" };
  }
  try {
    await t.sendMail({ from: { name: c.fromName, address: c.from }, ...mail });
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}

export async function adminRecipients() {
  const s = await getSettings();
  return s.email.adminRecipients.length ? s.email.adminRecipients : [s.company.email];
}

export async function verifySmtp() {
  const { t } = await transporter();
  if (!t) throw new Error("SMTP host and From address are required");
  await t.verify();
}
