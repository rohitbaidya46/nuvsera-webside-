import { Download } from "lucide-react";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { PageHeader, Pagination, fmtDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/db";

export const metadata = { title: "Applications" };
const PER = 30;

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ job?: string; status?: string; page?: string }> }) {
  await requireAdmin("applications.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = {
    ...(sp.job ? { jobId: sp.job === "general" ? null : sp.job } : {}),
    ...(sp.status && (APPLICATION_STATUSES as readonly string[]).includes(sp.status) ? { status: sp.status } : {}),
  };
  const [apps, count, jobs] = await Promise.all([
    prisma.jobApplication.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER, include: { job: { select: { title: true } } } }),
    prisma.jobApplication.count({ where }),
    prisma.job.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <>
      <PageHeader title="Job applications" description={`${count} application${count === 1 ? "" : "s"}. CVs contain personal data — download only when needed.`} />
      <form className="mb-4 flex flex-wrap gap-2">
        <label><span className="sr-only">Job</span><select name="job" defaultValue={sp.job ?? ""} className="field"><option value="">All positions</option><option value="general">General applications</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></label>
        <label><span className="sr-only">Status</span><select name="status" defaultValue={sp.status ?? ""} className="field"><option value="">All statuses</option>{APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        <button className="btn-outline">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Position</th><th className="px-4 py-3">Experience</th><th className="px-4 py-3">CV</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Received</th></tr></thead>
          <tbody className="divide-y divide-line">
            {apps.map((a) => (
              <tr key={a.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-fg">{a.name}</p>
                  <p className="text-xs text-muted"><a href={`mailto:${a.email}`} className="text-link">{a.email}</a> · {a.phone}</p>
                  <p className="text-xs text-muted">{[a.location, a.linkedin && <a key="l" href={a.linkedin} target="_blank" rel="noopener noreferrer" className="text-link">LinkedIn</a>, a.portfolio && <a key="p" href={a.portfolio} target="_blank" rel="noopener noreferrer" className="text-link">Portfolio</a>].filter(Boolean).map((x, i) => <span key={i}>{i > 0 && " · "}{x}</span>)}</p>
                  {a.coverLetter && <details className="mt-1 text-xs"><summary className="cursor-pointer text-link">Cover letter</summary><p className="mt-1 max-w-md whitespace-pre-wrap text-fg">{a.coverLetter}</p></details>}
                </td>
                <td className="px-4 py-3">{a.job?.title ?? "General"}</td>
                <td className="px-4 py-3">{a.experience ?? "—"}</td>
                <td className="px-4 py-3"><a href={`/api/admin/applications/${a.id}/cv`} className="inline-flex items-center gap-1 text-link"><Download className="h-4 w-4" /> {a.cvName.slice(0, 24)}</a></td>
                <td className="px-4 py-3"><StatusSelect endpoint={`/api/admin/applications/${a.id}`} value={a.status} options={[...APPLICATION_STATUSES]} label={`Status for ${a.name}`} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtDate(a.createdAt)}</td>
              </tr>
            ))}
            {apps.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No applications yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={Math.ceil(count / PER)} href={(p) => `/admin/applications?${new URLSearchParams({ ...(sp.job ? { job: sp.job } : {}), ...(sp.status ? { status: sp.status } : {}), page: String(p) })}`} />
    </>
  );
}
