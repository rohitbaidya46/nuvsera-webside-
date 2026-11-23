import { Download } from "lucide-react";
import { Badge, PageHeader, Pagination, fmtDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Newsletter" };
const PER = 50;

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  await requireAdmin("subscribers.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = sp.status ? { status: sp.status } : {};
  const [subs, count, active] = await Promise.all([
    prisma.subscriber.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER }),
    prisma.subscriber.count({ where }),
    prisma.subscriber.count({ where: { status: "ACTIVE" } }),
  ]);
  return (
    <>
      <PageHeader title="Newsletter subscribers" description={`${active} confirmed (double opt-in). Only email ACTIVE subscribers.`} actions={<a href="/api/admin/subscribers/export" className="btn-outline"><Download className="h-4 w-4" /> Export active (CSV)</a>} />
      <form className="mb-4 flex gap-2"><select name="status" defaultValue={sp.status ?? ""} className="field w-auto" aria-label="Status"><option value="">All</option><option value="ACTIVE">Active</option><option value="PENDING">Pending confirmation</option><option value="UNSUBSCRIBED">Unsubscribed</option></select><button className="btn-outline">Filter</button></form>
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Subscribed</th><th className="px-4 py-3">Unsubscribed</th></tr></thead>
          <tbody className="divide-y divide-line">
            {subs.map((s) => <tr key={s.id}><td className="px-4 py-3">{s.email}</td><td className="px-4 py-3"><Badge value={s.status} /></td><td className="px-4 py-3 text-muted">{fmtDate(s.createdAt)}</td><td className="px-4 py-3 text-muted">{fmtDate(s.unsubscribedAt)}</td></tr>)}
            {subs.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted">No subscribers yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(count / PER)} href={(p) => `/admin/subscribers?page=${p}${sp.status ? `&status=${sp.status}` : ""}`} />
    </>
  );
}
