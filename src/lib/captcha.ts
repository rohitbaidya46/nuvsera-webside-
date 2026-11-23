import { env } from "./env";
import { HttpError } from "./http";

/** Verifies an hCaptcha token server-side. Skipped (with a warning) only when no secret is configured. */
export async function verifyCaptcha(token: string | null | undefined, ip?: string | null) {
  const secret = env.hcaptchaSecret;
  if (!secret) {
    if (env.isProd) console.warn("[captcha] HCAPTCHA_SECRET is not set — captcha verification is DISABLED.");
    return;
  }
  if (!token) throw new HttpError(400, "Please complete the captcha.");
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const res = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(8000),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  if (!data.success) throw new HttpError(400, "Captcha verification failed. Please try again.");
}

/** Honeypot: real users never fill the hidden "website" field. */
export function isBot(honeypot: unknown, startedAt?: unknown): boolean {
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;
  const t = Number(startedAt);
  if (Number.isFinite(t) && t > 0 && Date.now() - t < 2500) return true; // submitted inhumanly fast
  return false;
}
