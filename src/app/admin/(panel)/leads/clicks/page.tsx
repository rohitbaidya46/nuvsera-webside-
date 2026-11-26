import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader, Pagination, fmtDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { can } from "@/lib/permissions";

export const metadata = { title: "WhatsApp & call enquiries" };
const PER = 50;
const LABEL: Record<string, string> = { whatsapp: "WhatsApp", phone: "Phone call", email: "Email" };

export default async function ClicksPage({ searchParams }: { searchParams: Promise<{ page?: string; channel?: string }> }) {
  const { user } = await requireAdmin("leads.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = sp.channel && LABEL[sp.channel] ? { channel: sp.channel } : {};
  const [rows, count] = await Promise.all([
    prisma.contactClick.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER }),
    prisma.contactClick.count({ where }),
  ]);
  return (
    <>
      <PageHeader
        title="WhatsApp & call enquiries"
        description="Every click on a WhatsApp, call or email button. The conversation itself happens in WhatsApp or on the phone, so no personal details are recorded here: log the enquiry as a lead once you have spoken to the visitor."
        actions={can(user.role, "leads.export") && <a className="btn-outline" href={`/api/admin/leads/clicks${sp.channel ? `?channel=${sp.channel}` : ""}`}><Download className="h-4 w-4" /> CSV</a>}
      />
      <nav aria-label="Channel" className="mb-4 flex flex-wrap gap-2">
        {[["", "All"], ["whatsapp", "WhatsApp"], ["phone", "Phone"], ["email", "Email"]].map(([v, l]) => (
          <Link key={v} href={v ? `/admin/leads/clicks?channel=${v}` : "/admin/leads/clicks"} className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${(sp.channel ?? "") === v ? "bg-navy text-white" : "border border-line bg-card text-fg"}`}>{l}</Link>
        ))}
        <Link href="/admin/leads" className="ml-auto text-sm font-medium text-link">← Form leads</Link>
      </nav>
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted"><tr><th className="p-3">When</th><th className="p-3">Channel</th><th className="p-3">Page</th><th className="p-3">Source</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}><td className="p-3 whitespace-nowrap">{fmtDate(r.createdAt)}</td><td className="p-3">{LABEL[r.channel] ?? r.channel}</td><td className="p-3 font-mono text-xs">{r.page}</td><td className="p-3">{r.source}</td></tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted">No clicks recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(count / PER)} href={(p) => `/admin/leads/clicks?${new URLSearchParams({ ...(sp.channel ? { channel: sp.channel } : {}), page: String(p) })}`} />
    </>
  );
}
