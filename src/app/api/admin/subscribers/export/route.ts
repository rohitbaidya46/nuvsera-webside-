import { audit } from "@/lib/audit";
import { download, toCsv } from "@/lib/admin/export";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { route } from "@/lib/http";

export const GET = route(async () => {
  const actor = await requireApi("subscribers.view");
  const subs = await prisma.subscriber.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } });
  await audit(actor, "subscribers.export", { details: { count: subs.length } });
  return download(
    toCsv(["Email", "Subscribed (UTC)", "Unsubscribe link"], subs.map((s) => [s.email, s.createdAt, `${env.appUrl}/newsletter/unsubscribe?token=${s.unsubscribeToken}`])),
    `subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
    "csv",
  );
});
