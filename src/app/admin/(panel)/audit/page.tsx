import { PageHeader, Pagination, fmtDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Audit log" };
const PER = 50;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ q?: string; user?: string; page?: string }> }) {
  await requireAdmin("audit.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = {
    ...(sp.q ? { action: { contains: sp.q.slice(0, 60), mode: "insensitive" as const } } : {}),
    ...(sp.user ? { userEmail: { contains: sp.user.slice(0, 100), mode: "insensitive" as const } } : {}),
  };
  const [rows, count] = await Promise.all([prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER }), prisma.auditLog.count({ where })]);
  return (
    <>
      <PageHeader title="Audit log" description="Who changed what, and when. Entries cannot be edited or deleted from the panel." />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={sp.q} placeholder="Action, e.g. lead. or auth.login" className="field w-auto" aria-label="Action" />
        <input name="user" defaultValue={sp.user} placeholder="User email" className="field w-auto" aria-label="User" />
        <button className="btn-outline">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">When (IST)</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Record</th><th className="px-4 py-3">Details</th><th className="px-4 py-3">IP</th></tr></thead>
          <tbody className="divide-y divide-line align-top">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted">{fmtDate(r.createdAt)}</td>
                <td className="px-4 py-2.5">{r.userEmail ?? "—"}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{r.action}</td>
                <td className="px-4 py-2.5 text-xs text-muted">{r.entity}{r.entityId ? ` · ${r.entityId.slice(-8)}` : ""}</td>
                <td className="max-w-md px-4 py-2.5">{r.details ? <details><summary className="cursor-pointer text-xs text-link">View</summary><pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap rounded bg-surface p-2 text-xs">{JSON.stringify(r.details, null, 2)}</pre></details> : "—"}</td>
                <td className="px-4 py-2.5 text-xs text-muted">{r.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(count / PER)} href={(p) => `/admin/audit?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.user ? { user: sp.user } : {}), page: String(p) })}`} />
    </>
  );
}
