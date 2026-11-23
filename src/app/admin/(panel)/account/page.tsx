import Link from "next/link";
import { RevokeSession } from "@/components/admin/RevokeSession";
import { PageHeader, Panel, fmtDate } from "@/components/admin/ui";
import { PASSWORD_MAX_AGE_DAYS, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLE_LABELS, permissionsFor } from "@/lib/permissions";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const s = await requireAdmin();
  const [user, sessions] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: s.user.id } }),
    prisma.session.findMany({ where: { userId: s.user.id }, orderBy: { lastSeenAt: "desc" } }),
  ]);
  const expires = new Date(user.passwordChangedAt.getTime() + PASSWORD_MAX_AGE_DAYS * 86400000);
  return (
    <>
      <PageHeader title="My account" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Profile">
          <dl className="space-y-2 text-sm">
            <div><dt className="text-muted">Name</dt><dd className="text-fg">{user.name}</dd></div>
            <div><dt className="text-muted">Email</dt><dd className="text-fg">{user.email}</dd></div>
            <div><dt className="text-muted">Role</dt><dd className="text-fg">{ROLE_LABELS[user.role]}</dd></div>
            <div><dt className="text-muted">Permissions</dt><dd className="text-xs text-fg">{permissionsFor(user.role).join(", ")}</dd></div>
          </dl>
        </Panel>
        <Panel title="Security">
          <dl className="space-y-2 text-sm">
            <div><dt className="text-muted">Two-factor authentication</dt><dd className="text-fg">{user.totpEnabled ? `Enabled · ${user.recoveryCodes.length} recovery codes left` : "Not enabled"}</dd></div>
            <div><dt className="text-muted">Password last changed</dt><dd className="text-fg">{fmtDate(user.passwordChangedAt)} — expires {fmtDate(expires, false)}</dd></div>
          </dl>
          <Link href="/admin/change-password" className="btn-outline mt-4">Change password</Link>
          <p className="mt-3 text-xs text-muted">Lost your authenticator device? Ask a Super Admin to reset your 2FA.</p>
        </Panel>
      </div>
      <Panel title="Active sessions" className="mt-4">
        <ul className="divide-y divide-line text-sm">
          {sessions.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0"><p className="truncate text-fg">{x.userAgent ?? "Unknown device"}</p><p className="text-xs text-muted">Last active {fmtDate(x.lastSeenAt)} · IP {x.ipAddress ?? "—"}{x.id === s.id ? " · this session" : ""}</p></div>
              {x.id !== s.id && <RevokeSession id={x.id} />}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
