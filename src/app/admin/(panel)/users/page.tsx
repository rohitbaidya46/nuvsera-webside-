import { UsersManager } from "@/components/admin/UsersManager";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Users & roles" };

export default async function UsersPage() {
  const { user } = await requireAdmin("users.manage");
  const users = await prisma.user.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] });
  const now = new Date();
  return (
    <>
      <PageHeader title="Users & roles" description="Every account must use two-factor authentication. Passwords expire every 90 days; accounts lock for 15 minutes after 5 failed attempts." />
      <UsersManager
        me={user.id}
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive, totpEnabled: u.totpEnabled, locked: !!u.lockedUntil && u.lockedUntil > now, lastLoginAt: u.lastLoginAt?.toISOString() ?? null, passwordChangedAt: u.passwordChangedAt.toISOString() }))}
      />
    </>
  );
}
