import { createHmac } from "node:crypto";
import { z } from "zod";
import { deriveSource, parseAttribution } from "@/lib/attribution";
import { hashIp } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { clientIp, json, route, userAgent } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|monitor|curl|wget|python|axios|node-fetch/i;
const path = z.string().max(300).regex(/^\/[A-Za-z0-9/_.\-~%]*$/).transform((p) => (p.length > 1 ? p.replace(/\/+$/, "") : p).slice(0, 200));

const schema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("view"), path }),
  z.object({ type: z.literal("click"), channel: z.enum(["whatsapp", "phone", "email"]), path, attribution: z.string().max(5000).optional() }),
]);

/** Today's date in IST as a UTC-midnight Date (matches a PostgreSQL DATE column). */
function istDay() {
  const d = new Date(Date.now() + 330 * 60000);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Cookieless, aggregate analytics for the admin dashboard and click-to-WhatsApp/call enquiry tracking.
 * Stores no IP address, no cookie and no cross-day identifier; honours Do-Not-Track / Global Privacy Control.
 */
export const POST = route(async (req: Request) => {
  const ua = (await userAgent()) || "";
  if (!ua || BOT.test(ua)) return json({ ok: true });
  const ip = await clientIp();
  const rl = await rateLimit(`track:${hashIp(ip)}`, 300, 3600);
  if (!rl.allowed) return json({ ok: true });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false }, 400);
  const d = parsed.data;
  if (d.path.startsWith("/admin") || d.path.startsWith("/api")) return json({ ok: true });

  if (d.type === "click") {
    const host = new URL(env.appUrl).hostname;
    await prisma.contactClick.create({ data: { channel: d.channel, page: d.path, source: deriveSource(parseAttribution(d.attribution), host) } });
    return json({ ok: true });
  }

  const optedOut = req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1";
  if (optedOut) return json({ ok: true });
  const day = istDay();
  const hash = createHmac("sha256", env.appSecret).update(`${day.toISOString()}|${ip}|${ua}`).digest("hex").slice(0, 32);
  await prisma.$transaction([
    prisma.$executeRaw`INSERT INTO "PageViewDaily" ("day", "path", "views") VALUES (${day}, ${d.path}, 1)
      ON CONFLICT ("day", "path") DO UPDATE SET "views" = "PageViewDaily"."views" + 1`,
    prisma.$executeRaw`INSERT INTO "VisitorDaily" ("day", "hash") VALUES (${day}, ${hash}) ON CONFLICT DO NOTHING`,
  ]);
  return json({ ok: true });
});
