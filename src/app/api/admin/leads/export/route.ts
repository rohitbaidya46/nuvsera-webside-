import { audit } from "@/lib/audit";
import { download, toCsv, toXlsx } from "@/lib/admin/export";
import { leadWhere } from "@/lib/admin/lead-filters";
import { requireApi } from "@/lib/auth";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { route } from "@/lib/http";

export const GET = route(async (req: Request) => {
  const actor = await requireApi("leads.export");
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const format = sp.format === "xlsx" ? "xlsx" : "csv";
  const leads = await prisma.lead.findMany({ where: leadWhere(sp, actor.id), orderBy: { createdAt: "desc" }, take: 20000, include: { assignedTo: { select: { name: true } } } });
  const headers = ["Received (UTC)", "Type", "Status", "Name", "Company", "Email", "Phone", "Service", "Budget", "Timeline", "Message", "Owner", "Channel", "Form page", "Landing page", "Referrer", "UTM source", "UTM medium", "UTM campaign", "UTM term", "UTM content", "gclid", "li_fat_id"];
  const rows = leads.map((l) => [l.createdAt, l.type, LEAD_STATUS_LABELS[l.status], l.name, l.company, l.email, l.phone, l.service, l.budget, l.timeline, l.message, l.assignedTo?.name, l.source, l.sourcePage, l.landingPage, l.referrer, l.utmSource, l.utmMedium, l.utmCampaign, l.utmTerm, l.utmContent, l.gclid, l.liFatId]);
  await audit(actor, "lead.export", { details: { format, count: leads.length, filters: sp } });
  const stamp = new Date().toISOString().slice(0, 10);
  return format === "csv" ? download(toCsv(headers, rows), `leads-${stamp}.csv`, "csv") : download(await toXlsx("Leads", headers, rows), `leads-${stamp}.xlsx`, "xlsx");
});
