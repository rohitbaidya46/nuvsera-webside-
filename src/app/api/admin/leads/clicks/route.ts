import { audit } from "@/lib/audit";
import { download, toCsv } from "@/lib/admin/export";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { route } from "@/lib/http";

/** CSV export of WhatsApp / call / email button clicks. */
export const GET = route(async (req: Request) => {
  const actor = await requireApi("leads.export");
  const channel = new URL(req.url).searchParams.get("channel");
  const rows = await prisma.contactClick.findMany({ where: channel ? { channel } : {}, orderBy: { createdAt: "desc" }, take: 20000 });
  await audit(actor, "lead.export", { details: { format: "csv", kind: "contact-clicks", count: rows.length } });
  return download(toCsv(["Clicked (UTC)", "Channel", "Page", "Source"], rows.map((r) => [r.createdAt, r.channel, r.page, r.source])), `contact-clicks-${new Date().toISOString().slice(0, 10)}.csv`, "csv");
});
