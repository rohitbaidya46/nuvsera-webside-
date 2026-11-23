import type { Role } from "@prisma/client";

export const PERMISSIONS = [
  "dashboard.view",
  "leads.view",
  "leads.edit",
  "leads.delete",
  "leads.export",
  "subscribers.view",
  "content.manage",
  "careers.manage",
  "applications.view",
  "media.manage",
  "settings.manage",
  "users.manage",
  "audit.view",
  "backups.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: PERMISSIONS,
  ADMIN: PERMISSIONS.filter((p) => p !== "users.manage" && p !== "backups.manage"),
  SALES: ["dashboard.view", "leads.view", "leads.edit", "leads.export", "subscribers.view"],
  CONTENT_EDITOR: ["dashboard.view", "content.manage", "careers.manage", "media.manage"],
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES: "Sales",
  CONTENT_EDITOR: "Content Editor",
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionsFor(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}
