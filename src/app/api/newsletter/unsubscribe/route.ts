import { z } from "zod";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";

export const POST = route(async (req: Request) => {
  const { token } = z.object({ token: z.string().min(10).max(100) }).parse(await req.json());
  const sub = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!sub) throw new HttpError(400, "Invalid link");
  await prisma.subscriber.update({ where: { id: sub.id }, data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() } });
  return json({ ok: true });
});
