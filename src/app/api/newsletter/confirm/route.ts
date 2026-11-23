import { z } from "zod";
import { randomToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";

export const POST = route(async (req: Request) => {
  const { token } = z.object({ token: z.string().min(10).max(100) }).parse(await req.json());
  const sub = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!sub || sub.status !== "PENDING") throw new HttpError(400, "Invalid or expired link");
  // Rotate the token so the confirmation link cannot be reused; new token is used for unsubscribe links.
  await prisma.subscriber.update({ where: { id: sub.id }, data: { status: "ACTIVE", unsubscribeToken: randomToken(24) } });
  return json({ ok: true });
});
