"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api } from "./api";
import { Panel, fmtDate } from "./ui";

type U = { id: string; name: string; email: string; role: string; isActive: boolean; totpEnabled: boolean; locked: boolean; lastLoginAt: string | null; passwordChangedAt: string };
const ROLES = [["SUPER_ADMIN", "Super Admin"], ["ADMIN", "Admin"], ["SALES", "Sales"], ["CONTENT_EDITOR", "Content Editor"]];

export function UsersManager({ users, me }: { users: U[]; me: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [invite, setInvite] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const act = (id: string, body: Record<string, unknown>, ok: string, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    api(`/api/admin/users/${id}`, { method: "PATCH", body }).then(() => { setMsg({ ok: true, text: ok }); router.refresh(); }).catch((e) => setMsg({ ok: false, text: e.message }));
  };

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const fd = new FormData(f);
    setErrors({});
    try {
      const r = await api<{ inviteLink: string }>("/api/admin/users", { body: { name: fd.get("name"), email: fd.get("email"), role: fd.get("role") } });
      setInvite(r.inviteLink);
      setMsg({ ok: true, text: "User created and invitation emailed." });
      f.reset();
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed" });
      if (err instanceof ApiError) setErrors(err.fields);
    }
  }

  return (
    <div className="space-y-4">
      {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-lg px-4 py-2.5 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200"}`}>{msg.text}</p>}
      {invite && <p className="rounded-lg bg-surface p-3 text-xs text-muted">If email is not configured yet, share this one-time link securely (valid 48 hours):<br /><code className="break-all text-fg">{invite}</code></p>}
      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Security</th><th className="px-4 py-3">Last login</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className={u.isActive ? "" : "opacity-60"}>
                <td className="px-4 py-3"><p className="font-medium text-fg">{u.name} {u.id === me && <span className="text-xs text-muted">(you)</span>}</p><p className="text-xs text-muted">{u.email}</p></td>
                <td className="px-4 py-3">
                  <select aria-label={`Role for ${u.name}`} defaultValue={u.role} disabled={u.id === me} className="field py-1.5" onChange={(e) => act(u.id, { role: e.target.value }, "Role updated")}>
                    {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs">
                  <p>{u.totpEnabled ? "✓ 2FA enabled" : "⚠ 2FA not set up"}</p>
                  <p className="text-muted">Password changed {fmtDate(u.passwordChangedAt, false)}</p>
                  {u.locked && <p className="font-semibold text-red-600">Locked</p>}
                  {!u.isActive && <p className="font-semibold text-muted">Deactivated</p>}
                </td>
                <td className="px-4 py-3 text-muted">{fmtDate(u.lastLoginAt)}</td>
                <td className="px-4 py-3">
                  {u.id !== me && (
                    <div className="flex flex-wrap gap-1.5">
                      {u.locked && <button className="btn-outline min-h-8 px-2.5 py-1 text-xs" onClick={() => act(u.id, { action: "unlock" }, "Account unlocked")}>Unlock</button>}
                      <button className="btn-outline min-h-8 px-2.5 py-1 text-xs" onClick={() => act(u.id, { action: "reset2fa" }, "2FA reset — user must enrol again", "Reset this user’s two-factor authentication?")}>Reset 2FA</button>
                      <button className="btn-outline min-h-8 px-2.5 py-1 text-xs" onClick={() => act(u.id, { action: "forcePasswordChange" }, "User must change password at next login")}>Force password change</button>
                      <button className="btn-outline min-h-8 px-2.5 py-1 text-xs" onClick={() => act(u.id, { action: "signOutEverywhere" }, "All sessions ended")}>Sign out</button>
                      <button className="btn-outline min-h-8 px-2.5 py-1 text-xs" onClick={() => act(u.id, { isActive: !u.isActive }, u.isActive ? "User deactivated" : "User reactivated", u.isActive ? "Deactivate this user? They will be signed out immediately." : undefined)}>{u.isActive ? "Deactivate" : "Reactivate"}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Panel title="Invite a new user">
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-4 sm:items-end">
          <label><span className="field-label">Name</span><input name="name" required className="field" /></label>
          <label><span className="field-label">Email</span><input name="email" type="email" required className="field" aria-invalid={!!errors.email} />{errors.email && <span className="field-error block">{errors.email}</span>}</label>
          <label><span className="field-label">Role</span><select name="role" className="field" defaultValue="CONTENT_EDITOR">{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <button className="btn-navy">Create & send invite</button>
        </form>
        <dl className="mt-5 grid gap-3 text-xs text-muted sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="font-semibold text-fg">Super Admin</dt><dd>Everything, including users, roles and backups.</dd></div>
          <div><dt className="font-semibold text-fg">Admin</dt><dd>Leads, content, careers, settings and audit log.</dd></div>
          <div><dt className="font-semibold text-fg">Sales</dt><dd>Dashboard, leads CRM, exports and newsletter list.</dd></div>
          <div><dt className="font-semibold text-fg">Content Editor</dt><dd>Pages, services, blog, portfolio, team, FAQs, jobs and media.</dd></div>
        </dl>
      </Panel>
    </div>
  );
}
