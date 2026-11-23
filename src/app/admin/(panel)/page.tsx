import Link from "next/link";
import { BarList, WeeklyBars } from "@/components/admin/Charts";
import { Badge, PageHeader, Panel, fmtDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { can } from "@/lib/permissions";

export const metadata = { title: "Dashboard" };

function startOfDayIST(offsetDays = 0) {
  const now = new Date();
  const ist = new Date(now.getTime() + 330 * 60000);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - 330 * 60000 - offsetDays * 86400000);
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { user } = await requireAdmin("dashboard.view");
  const { denied } = await searchParams;
  const showLeads = can(user.role, "leads.view");

  if (!showLeads) {
    const [posts, drafts, jobs] = await Promise.all([
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: { in: ["DRAFT", "SCHEDULED"] } } }),
      prisma.job.count({ where: { published: true } }),
    ]);
    return (
      <>
        <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} description="Content overview" />
        {denied && <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">You don’t have permission to open that page.</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          {[["Published posts", posts, "/admin/content/blog"], ["Drafts & scheduled", drafts, "/admin/content/blog"], ["Open jobs", jobs, "/admin/content/jobs"]].map(([l, v, h]) => (
            <Link key={l as string} href={h as string} className="rounded-xl border border-line bg-card p-5 hover:border-brand/40"><p className="text-sm text-muted">{l}</p><p className="mt-1 text-3xl font-bold text-fg">{v}</p></Link>
          ))}
        </div>
      </>
    );
  }

  const today = startOfDayIST(0);
  const week = startOfDayIST(6);
  const month = startOfDayIST(29);
  const since12w = startOfDayIST(7 * 12 - 1);

  const [cToday, cWeek, cMonth, total, won, byService, bySource, latest, weekly, services, dueReminders] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: today } } }),
    prisma.lead.count({ where: { createdAt: { gte: week } } }),
    prisma.lead.count({ where: { createdAt: { gte: month } } }),
    prisma.lead.count({ where: { createdAt: { gte: since12w } } }),
    prisma.lead.count({ where: { createdAt: { gte: since12w }, status: "WON" } }),
    prisma.lead.groupBy({ by: ["service"], where: { createdAt: { gte: month } }, _count: true, orderBy: { _count: { service: "desc" } } }),
    prisma.lead.groupBy({ by: ["source"], where: { createdAt: { gte: month } }, _count: true, orderBy: { _count: { source: "desc" } } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, company: true, service: true, status: true, createdAt: true } }),
    prisma.$queryRaw<{ wk: Date; leads: bigint; won: bigint }[]>`
      SELECT date_trunc('week', "createdAt" AT TIME ZONE 'Asia/Kolkata') AS wk, COUNT(*) AS leads, COUNT(*) FILTER (WHERE status = 'WON') AS won
      FROM "Lead" WHERE "createdAt" >= ${since12w} GROUP BY 1 ORDER BY 1`,
    prisma.service.findMany({ select: { slug: true, title: true } }),
    prisma.leadReminder.findMany({ where: { done: false, dueAt: { lte: new Date(Date.now() + 86400000) }, ...(user.role === "SALES" ? { userId: user.id } : {}) }, include: { lead: { select: { id: true, name: true } } }, orderBy: { dueAt: "asc" }, take: 6 }),
  ]);

  const titles = new Map(services.map((s) => [s.slug, s.title]));
  const weekMap = new Map(weekly.map((w) => [w.wk.toISOString().slice(0, 10), w]));
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(startOfDayIST(0).getTime() + 330 * 60000);
    const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
    d.setUTCDate(d.getUTCDate() - dow - (11 - i) * 7);
    const key = d.toISOString().slice(0, 10);
    const w = weekMap.get(key);
    return { label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }), leads: Number(w?.leads ?? 0), won: Number(w?.won ?? 0) };
  });

  return (
    <>
      <PageHeader title="Dashboard" description="Enquiries and conversions at a glance (times in IST)." actions={<Link href="/admin/leads" className="btn-navy">View all leads</Link>} />
      {denied && <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">You don’t have permission to open that page.</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[["Leads today", cToday], ["Last 7 days", cWeek], ["Last 30 days", cMonth], ["Conversion (12 wks)", total ? `${Math.round((won / total) * 100)}%` : "—"]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border border-line bg-card p-5">
            <p className="text-sm text-muted">{l}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-fg">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Leads per week — last 12 weeks" className="lg:col-span-2"><WeeklyBars data={weeks} /></Panel>
        <Panel title="Follow-ups due">
          {dueReminders.length === 0 ? <p className="text-sm text-muted">Nothing due in the next 24 hours.</p> : (
            <ul className="space-y-3 text-sm">
              {dueReminders.map((r) => (
                <li key={r.id}><Link href={`/admin/leads/${r.lead.id}`} className="font-medium text-link">{r.lead.name}</Link><p className={r.dueAt < new Date() ? "text-red-600" : "text-muted"}>{fmtDate(r.dueAt)} — {r.note || "Follow up"}</p></li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="By service (30 days)"><BarList rows={byService.map((s) => ({ label: titles.get(s.service ?? "") ?? "Not specified", value: s._count }))} /></Panel>
        <Panel title="By source (30 days)"><BarList rows={bySource.map((s) => ({ label: s.source ?? "unknown", value: s._count }))} /></Panel>
        <Panel title="Latest enquiries">
          <ul className="divide-y divide-line text-sm">
            {latest.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0"><Link href={`/admin/leads/${l.id}`} className="block truncate font-medium text-link">{l.name}{l.company ? ` · ${l.company}` : ""}</Link><p className="truncate text-xs text-muted">{titles.get(l.service ?? "") ?? "—"} · {fmtDate(l.createdAt)}</p></div>
                <Badge value={l.status} />
              </li>
            ))}
            {latest.length === 0 && <li className="py-2 text-muted">No enquiries yet.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
