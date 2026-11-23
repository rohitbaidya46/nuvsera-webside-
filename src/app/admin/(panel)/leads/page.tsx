import Link from "next/link";
import { Download, Paperclip } from "lucide-react";
import { Badge, PageHeader, Pagination, fmtDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { leadWhere, type LeadQuery } from "@/lib/admin/lead-filters";
import { can } from "@/lib/permissions";

export const metadata = { title: "Leads" };
const PER = 25;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<LeadQuery> }) {
  const { user } = await requireAdmin("leads.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = leadWhere(sp, user.id);
  const [leads, count, services, sources, team, statusCounts] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER, include: { assignedTo: { select: { name: true } } } }),
    prisma.lead.count({ where }),
    prisma.service.findMany({ select: { slug: true, title: true }, orderBy: { order: "asc" } }),
    prisma.lead.findMany({ distinct: ["source"], select: { source: true }, where: { source: { not: null } } }),
    prisma.user.findMany({ where: { isActive: true, role: { in: ["SUPER_ADMIN", "ADMIN", "SALES"] } }, select: { id: true, name: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const titles = new Map(services.map((s) => [s.slug, s.title]));
  const qs = (extra: Record<string, string>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...extra }).filter(([, v]) => v) as [string, string][]);
    return p.toString();
  };
  const counts = new Map(statusCounts.map((s) => [s.status, s._count]));

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${count} matching enquiries`}
        actions={can(user.role, "leads.export") && (
          <>
            <a className="btn-outline" href={`/api/admin/leads/export?${qs({ format: "csv" })}`}><Download className="h-4 w-4" /> CSV</a>
            <a className="btn-outline" href={`/api/admin/leads/export?${qs({ format: "xlsx" })}`}><Download className="h-4 w-4" /> Excel</a>
          </>
        )}
      />
      <nav aria-label="Pipeline" className="mb-4 flex flex-wrap gap-2">
        <Link href={`/admin/leads?${qs({ status: "", page: "" })}`} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${!sp.status ? "bg-navy text-white" : "bg-card text-fg border border-line"}`}>All</Link>
        {LEAD_STATUSES.map((s) => (
          <Link key={s} href={`/admin/leads?${qs({ status: s, page: "" })}`} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${sp.status === s ? "bg-navy text-white" : "border border-line bg-card text-fg"}`}>
            {LEAD_STATUS_LABELS[s]} <span className="opacity-70">({counts.get(s) ?? 0})</span>
          </Link>
        ))}
      </nav>
      <form className="mb-4 grid gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-6" role="search">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <label className="lg:col-span-2"><span className="sr-only">Search</span><input name="q" defaultValue={sp.q} placeholder="Search name, email, company, phone…" className="field" /></label>
        <label><span className="sr-only">Service</span><select name="service" defaultValue={sp.service ?? ""} className="field"><option value="">All services</option>{services.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}</select></label>
        <label><span className="sr-only">Source</span><select name="source" defaultValue={sp.source ?? ""} className="field"><option value="">All sources</option>{sources.map((s) => <option key={s.source} value={s.source!}>{s.source}</option>)}</select></label>
        <label><span className="sr-only">Assignee</span><select name="assignee" defaultValue={sp.assignee ?? ""} className="field"><option value="">Anyone</option><option value="me">Assigned to me</option><option value="none">Unassigned</option>{team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <div className="flex gap-2">
          <label className="flex-1"><span className="sr-only">From</span><input type="date" name="from" defaultValue={sp.from} className="field" aria-label="From date" /></label>
          <label className="flex-1"><span className="sr-only">To</span><input type="date" name="to" defaultValue={sp.to} className="field" aria-label="To date" /></label>
        </div>
        <div className="flex gap-2 lg:col-span-6"><button className="btn-navy">Apply filters</button><Link href="/admin/leads" className="btn-outline">Reset</Link></div>
      </form>
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Budget</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Received</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-surface/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="font-medium text-link">{l.name}</Link>
                  {l.attachmentKey && <Paperclip className="ml-1 inline h-3.5 w-3.5 text-muted" aria-label="Has attachment" />}
                  <p className="text-xs text-muted">{[l.company, l.email].filter(Boolean).join(" · ")}</p>
                </td>
                <td className="px-4 py-3">{titles.get(l.service ?? "") ?? "—"}<p className="text-xs text-muted">{l.type === "QUOTE" ? "Quote wizard" : "Contact form"}</p></td>
                <td className="px-4 py-3">{l.budget ?? "—"}</td>
                <td className="px-4 py-3">{l.source ?? "—"}{l.utmCampaign && <p className="text-xs text-muted">{l.utmCampaign}</p>}</td>
                <td className="px-4 py-3">{l.assignedTo?.name ?? <span className="text-muted">Unassigned</span>}</td>
                <td className="px-4 py-3"><Badge value={l.status} label={LEAD_STATUS_LABELS[l.status]} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtDate(l.createdAt)}</td>
              </tr>
            ))}
            {leads.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No leads match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(count / PER)} href={(p) => `/admin/leads?${qs({ page: String(p) })}`} />
    </>
  );
}
