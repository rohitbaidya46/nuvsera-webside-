"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from "@/lib/constants";
import { api } from "./api";
import { Panel, fmtDate } from "./ui";

type Reminder = { id: string; dueAt: string; note: string | null; done: boolean; user: string | null };

export function LeadActions({ lead, team, canEdit, canDelete, reminders }: {
  lead: { id: string; status: string; assignedToId: string | null; email: string; name: string };
  team: { id: string; name: string }[];
  canEdit: boolean;
  canDelete: boolean;
  reminders: Reminder[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const base = `/api/admin/leads/${lead.id}`;

  async function run(key: string, fn: () => Promise<unknown>, ok: string, form?: HTMLFormElement) {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
      setMsg({ text: ok, ok: true });
      form?.reset();
      router.refresh();
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Failed", ok: false });
    } finally {
      setBusy(null);
    }
  }

  if (!canEdit) return null;

  return (
    <>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-lg px-4 py-2.5 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200"}`}>{msg.text}</p>}
      <Panel title="Pipeline">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label">Status</span>
            <select className="field" defaultValue={lead.status} onChange={(e) => run("status", () => api(base, { method: "PATCH", body: { status: e.target.value } }), "Status updated")}>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Assigned to</span>
            <select className="field" defaultValue={lead.assignedToId ?? ""} onChange={(e) => run("assign", () => api(base, { method: "PATCH", body: { assignedToId: e.target.value || null } }), "Assignment updated")}>
              <option value="">Unassigned</option>
              {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
        </div>
      </Panel>

      <Panel title="Reply by email">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            const fd = new FormData(f);
            run("email", () => api(`${base}/email`, { body: { subject: fd.get("subject"), body: fd.get("body") } }), "Email sent", f);
          }}
          className="space-y-3"
        >
          <p className="text-sm text-muted">To: {lead.name} &lt;{lead.email}&gt;</p>
          <label className="block"><span className="field-label">Subject</span><input name="subject" required maxLength={200} defaultValue="Re: Your enquiry with Nuvsera Technology" className="field" /></label>
          <label className="block"><span className="field-label">Message</span><textarea name="body" required rows={6} maxLength={10000} className="field" defaultValue={`Dear ${lead.name.split(" ")[0]},\n\nThank you for your enquiry.\n\n\nKind regards,`} /></label>
          <button className="btn-navy" disabled={busy === "email"}>{busy === "email" ? "Sending…" : "Send email"}</button>
        </form>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Add note">
          <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; run("note", () => api(`${base}/notes`, { body: { body: new FormData(f).get("body") } }), "Note added", f); }} className="space-y-3">
            <label className="block"><span className="sr-only">Note</span><textarea name="body" required rows={3} maxLength={5000} className="field" placeholder="Call summary, next steps…" /></label>
            <button className="btn-outline" disabled={busy === "note"}>Save note</button>
          </form>
        </Panel>
        <Panel title="Follow-up reminders">
          <ul className="mb-3 space-y-2 text-sm">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-2">
                <span className={r.done ? "text-muted line-through" : new Date(r.dueAt) < new Date() ? "text-red-600" : "text-fg"}>{fmtDate(r.dueAt)} — {r.note || "Follow up"}{r.user ? ` (${r.user})` : ""}</span>
                {!r.done && <button onClick={() => run("rem", () => api(`${base}/reminders`, { method: "PATCH", body: { reminderId: r.id, done: true } }), "Reminder completed")} className="shrink-0 rounded p-1 text-emerald-700 hover:bg-surface" aria-label="Mark reminder done"><Check className="h-4 w-4" /></button>}
              </li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const fd = new FormData(f); run("rem", () => api(`${base}/reminders`, { body: { dueAt: new Date(String(fd.get("dueAt"))).toISOString(), note: fd.get("note") } }), "Reminder set", f); }} className="space-y-2">
            <label className="block"><span className="sr-only">Due</span><input type="datetime-local" name="dueAt" required className="field" aria-label="Reminder date and time" /></label>
            <label className="block"><span className="sr-only">Note</span><input name="note" maxLength={300} className="field" placeholder="What to do" /></label>
            <button className="btn-outline">Add reminder</button>
          </form>
        </Panel>
      </div>

      {canDelete && (
        <div className="flex justify-end">
          <button
            className="btn text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            onClick={() => {
              if (!confirm("Permanently delete this lead, its notes and attachment? This cannot be undone.")) return;
              api(base, { method: "DELETE" }).then(() => router.replace("/admin/leads")).catch((e) => setMsg({ text: e.message, ok: false }));
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete lead
          </button>
        </div>
      )}
    </>
  );
}
