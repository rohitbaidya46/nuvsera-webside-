import { z } from "zod";
import { audit } from "@/lib/audit";
import { assertRole, requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";

const schema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SALES", "CONTENT_EDITOR"]).optional(),
  isActive: z.boolean().optional(),
  action: z.enum(["reset2fa", "unlock", "forcePasswordChange", "signOutEverywhere"]).optional(),
});

export const PATCH = route(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireApi("users.manage");
  const { id } = await params;
  const d = schema.parse(await req.json());
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new HttpError(404, "User not found");
  if (d.role) assertRole(actor, d.role);
  if (id === actor.id && (d.role && d.role !== target.role || d.isActive === false)) throw new HttpError(400, "You cannot change your own role or deactivate yourself.");
  if (target.role === "SUPER_ADMIN" && ((d.role && d.role !== "SUPER_ADMIN") || d.isActive === false)) {
    const supers = await prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
    if (supers <= 1) throw new HttpError(400, "There must always be at least one active Super Admin.");
  }
  const data: Record<string, unknown> = {};
  if (d.role) data.role = d.role;
  if (d.isActive !== undefined) data.isActive = d.isActive;
  if (d.action === "reset2fa") Object.assign(data, { totpEnabled: false, totpSecret: null, recoveryCodes: [] });
  if (d.action === "unlock") Object.assign(data, { failedLogins: 0, lockedUntil: null });
  if (d.action === "forcePasswordChange") data.mustChangePassword = true;
  await prisma.user.update({ where: { id }, data });
  if (d.isActive === false || d.action === "reset2fa" || d.action === "signOutEverywhere" || d.role) await prisma.session.deleteMany({ where: { userId: id } });
  await audit(actor, `user.${d.action ?? "update"}`, { entity: "user", entityId: id, details: { email: target.email, ...d } });
  return json({ ok: true });
});
