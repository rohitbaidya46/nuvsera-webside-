import { z } from "zod";
import { hashIp } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { clientIp, json, route, userAgent } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  consentId: z.string().uuid(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  action: z.enum(["accept_all", "reject_all", "custom"]),
  version: z.string().max(20),
});

/** Records each consent decision as evidence of consent (DPDP Act 2023, s.6). No personal data beyond a hashed IP. */
export const POST = route(async (req: Request) => {
  const ipHash = hashIp(await clientIp());
  const rl = await rateLimit(`consent:${ipHash}`, 30, 3600);
  if (!rl.allowed) return json({ ok: true });
  const d = schema.parse(await req.json());
  await prisma.consentRecord.create({ data: { ...d, necessary: true, ipHash, userAgent: await userAgent() } });
  return json({ ok: true });
});
