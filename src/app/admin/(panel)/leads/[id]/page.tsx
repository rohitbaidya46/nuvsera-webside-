import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { LeadActions } from "@/components/admin/LeadActions";
import { Badge, PageHeader, Panel, fmtDate } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { can } from "@/lib/permissions";

export const metadata = { title: "Lead" };

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireAdmin("leads.view");
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      reminders: { include: { user: { select: { name: true } } }, orderBy: { dueAt: "asc" } },
      emails: { include: { sender: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      activities: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!lead) notFound();
  const [service, team] = await Promise.all([
    lead.service ? prisma.service.findUnique({ where: { slug: lead.service }, select: { title: true } }) : null,
    prisma.user.findMany({ where: { isActive: true, role: { in: ["SUPER_ADMIN", "ADMIN", "SALES"] } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const d = (lead.details ?? {}) as Record<string, unknown>;
  const info: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${lead.email}`} className="text-link">{lead.email}</a>],
    ["Phone", lead.phone ? <a key="p" href={`tel:${lead.phone}`} className="text-link">{lead.phone}</a> : "—"],
    ["Company", lead.company ?? "—"],
    ["Service", service?.title ?? lead.service ?? "—"],
    ["Budget", lead.budget ?? "—"],
    ["Timeline", lead.timeline ?? "—"],
    ...(lead.type === "QUOTE"
      ? ([["Project type", String(d.projectType ?? "—")], ["Platforms", Array.isArray(d.platforms) ? (d.platforms as string[]).join(", ") || "—" : "—"], ["Designs ready", String(d.hasDesigns ?? "—")], ["Preferred contact", String(d.preferredContact ?? "—")]] as [string, string][])
      : []),
  ];
  const attribution: [string, string | null][] = [
    ["Channel", lead.source], ["Form page", lead.sourcePage], ["Landing page", lead.landingPage], ["Referrer", lead.referrer],
    ["UTM source", lead.utmSource], ["UTM medium", lead.utmMedium], ["UTM campaign", lead.utmCampaign], ["UTM term", lead.utmTerm], ["UTM content", lead.utmContent],
    ["Google click ID", lead.gclid || lead.gbraid || lead.wbraid], ["LinkedIn click ID", lead.liFatId],
  ];

  return (
    <>
      <Link href="/admin/leads" className="mb-3 inline-flex items-center gap-1 text-sm text-link"><ArrowLeft className="h-4 w-4" /> All leads</Link>
      <PageHeader title={lead.name} description={`${lead.type === "QUOTE" ? "Quote request" : "Contact enquiry"} · received ${fmtDate(lead.createdAt)}`} actions={<Badge value={lead.status} label={LEAD_STATUS_LABELS[lead.status]} />} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Enquiry">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {info.map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="font-medium text-fg">{v}</dd></div>)}
            </dl>
            <div className="mt-5"><p className="text-sm text-muted">Message</p><p className="mt-1 whitespace-pre-wrap text-sm text-fg">{lead.message}</p></div>
            {typeof d.features === "string" && d.features && <div className="mt-4"><p className="text-sm text-muted">Features / integrations</p><p className="mt-1 whitespace-pre-wrap text-sm text-fg">{d.features}</p></div>}
            {lead.attachmentKey && (
              <a href={`/api/admin/leads/${lead.id}/attachment`} className="btn-outline mt-5"><Paperclip className="h-4 w-4" /> {lead.attachmentName} ({Math.round((lead.attachmentSize ?? 0) / 1024)} KB)</a>
            )}
            <p className="mt-4 text-xs text-muted">Consent to be contacted recorded {fmtDate(lead.consentAt)}.</p>
          </Panel>
          <LeadActions
            lead={{ id: lead.id, status: lead.status, assignedToId: lead.assignedToId, email: lead.email, name: lead.name }}
            team={team}
            canEdit={can(user.role, "leads.edit")}
            canDelete={can(user.role, "leads.delete")}
            reminders={lead.reminders.map((r) => ({ id: r.id, dueAt: r.dueAt.toISOString(), note: r.note, done: r.done, user: r.user?.name ?? null }))}
          />
          <Panel title="Emails sent from the panel">
            {lead.emails.length === 0 ? <p className="text-sm text-muted">No emails yet.</p> : (
              <ul className="space-y-4">{lead.emails.map((e) => (
                <li key={e.id} className="rounded-lg bg-surface p-4 text-sm">
                  <p className="font-medium text-fg">{e.subject} {e.status === "FAILED" && <span className="text-red-600">(failed: {e.error})</span>}</p>
                  <p className="text-xs text-muted">{e.sender?.name ?? "—"} · {fmtDate(e.createdAt)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-fg">{e.body}</p>
                </li>
              ))}</ul>
            )}
          </Panel>
          <Panel title="Notes">
            {lead.notes.length === 0 ? <p className="text-sm text-muted">No notes yet.</p> : (
              <ul className="space-y-3">{lead.notes.map((n) => (
                <li key={n.id} className="rounded-lg bg-surface p-3 text-sm"><p className="whitespace-pre-wrap text-fg">{n.body}</p><p className="mt-1 text-xs text-muted">{n.author?.name ?? "—"} · {fmtDate(n.createdAt)}</p></li>
              ))}</ul>
            )}
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Lead source">
            <dl className="space-y-2 text-sm">{attribution.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="break-all text-fg">{v}</dd></div>)}</dl>
          </Panel>
          <Panel title="Activity">
            <ol className="space-y-3 text-sm">{lead.activities.map((a) => (
              <li key={a.id} className="border-l-2 border-line pl-3"><p className="text-fg">{a.message}</p><p className="text-xs text-muted">{a.user?.name ?? "System"} · {fmtDate(a.createdAt)}</p></li>
            ))}</ol>
          </Panel>
        </div>
      </div>
    </>
  );
}
