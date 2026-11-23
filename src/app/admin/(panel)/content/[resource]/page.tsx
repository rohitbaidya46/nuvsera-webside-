import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge, PageHeader, Pagination, fmtDate } from "@/components/admin/ui";
import { delegate } from "@/lib/admin/resource-server";
import { getResource } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth";

const PER = 30;

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  return { title: getResource((await params).resource)?.label ?? "Content" };
}

export default async function ResourceList({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; page?: string }> }) {
  const r = getResource((await params).resource);
  if (!r) notFound();
  await requireAdmin(r.permission);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.slice(0, 100);
  const where = q ? { OR: r.searchFields.map((f) => ({ [f]: { contains: q, mode: "insensitive" } })) } : {};
  const db = delegate(r);
  const [rows, count] = await Promise.all([db.findMany({ where, orderBy: r.orderBy, skip: (page - 1) * PER, take: PER }), db.count({ where })]);

  return (
    <>
      <PageHeader title={r.label} description={`${count} item${count === 1 ? "" : "s"}`} actions={r.canCreate !== false && <Link href={`/admin/content/${r.key}/new`} className="btn-navy"><Plus className="h-4 w-4" /> New {r.singular.toLowerCase()}</Link>} />
      <form role="search" className="mb-4 flex gap-2">
        <label className="flex-1"><span className="sr-only">Search</span><input name="q" defaultValue={q} placeholder={`Search ${r.label.toLowerCase()}…`} className="field" /></label>
        <button className="btn-outline">Search</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted"><tr>{r.listColumns.map((c) => <th key={c.name} className="px-4 py-3">{c.label}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={String(row.id)} className="hover:bg-surface/60">
                {r.listColumns.map((c, i) => {
                  const v = row[c.name];
                  const content = c.kind === "bool" ? (v ? "Yes" : "No") : c.kind === "date" ? fmtDate(v as Date, false) : c.kind === "status" ? <Badge value={String(v)} /> : String(v ?? "—");
                  return <td key={c.name} className="px-4 py-3">{i === 0 ? <Link href={`/admin/content/${r.key}/${row.id}`} className="font-medium text-link">{content}</Link> : content}</td>;
                })}
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={r.listColumns.length} className="px-4 py-10 text-center text-muted">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(count / PER)} href={(p) => `/admin/content/${r.key}?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`} />
    </>
  );
}
