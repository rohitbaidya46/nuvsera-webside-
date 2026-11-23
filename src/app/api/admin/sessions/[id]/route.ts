import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { json, route } from "@/lib/http";

/** Users can revoke their own sessions (e.g. a forgotten browser). */
export const DELETE = route(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const actor = await requireApi();
  const { id } = await params;
  await prisma.session.deleteMany({ where: { id, userId: actor.id } });
  await audit(actor, "auth.session.revoked", { entity: "session", entityId: id });
  return json({ ok: true });
});
