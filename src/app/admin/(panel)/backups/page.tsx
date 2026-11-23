import { Download } from "lucide-react";
import { RunBackup } from "@/components/admin/RunBackup";
import { Badge, PageHeader, Panel, fmtDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Backups" };

export default async function BackupsPage() {
  await requireAdmin("backups.manage");
  const backups = await prisma.backup.findMany({ orderBy: { createdAt: "desc" }, take: 60 });
  return (
    <>
      <PageHeader title="Backups" description={`Encrypted application backups run daily at 02:30 IST and are kept for ${process.env.BACKUP_RETENTION_DAYS || 30} days.`} actions={<RunBackup />} />
      <Panel className="mb-4">
        <p className="text-sm text-muted">These backups contain all website content, leads, users and settings, encrypted with your <code>ENCRYPTION_KEY</code>. Uploaded files live in your storage bucket/volume — back that up too. For production, also enable database-level backups (e.g. Amazon RDS automated snapshots, or the <code>db-backup</code> service in <code>docker-compose.yml</code>). See the README for restore steps.</p>
      </Panel>
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Created</th><th className="px-4 py-3">Trigger</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Size</th><th className="px-4 py-3"><span className="sr-only">Download</span></th></tr></thead>
          <tbody className="divide-y divide-line">
            {backups.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3">{fmtDate(b.createdAt)}</td>
                <td className="px-4 py-3">{b.trigger}</td>
                <td className="px-4 py-3"><Badge value={b.status === "SUCCESS" ? "ACTIVE" : "LOST"} label={b.status === "SUCCESS" ? "Success" : `Failed${b.error ? `: ${b.error.slice(0, 60)}` : ""}`} /></td>
                <td className="px-4 py-3">{b.size ? `${(b.size / 1024).toFixed(0)} KB` : "—"}</td>
                <td className="px-4 py-3">{b.key && <a className="inline-flex items-center gap-1 text-link" href={`/api/admin/backups/${b.id}`}><Download className="h-4 w-4" /> Download</a>}</td>
              </tr>
            ))}
            {backups.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No backups yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
