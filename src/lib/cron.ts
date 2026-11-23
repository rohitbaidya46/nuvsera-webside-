import { env } from "./env";
import { safeEqual } from "./crypto";
import { HttpError } from "./http";

/** Cron endpoints accept `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this automatically). */
export function assertCron(req: Request) {
  const secret = env.cronSecret;
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!secret || !got || !safeEqual(got, secret)) throw new HttpError(401, "Unauthorised");
}
