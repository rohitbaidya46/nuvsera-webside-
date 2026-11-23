import { audit } from "@/lib/audit";
import { destroySession, getSession } from "@/lib/auth";
import { json, route } from "@/lib/http";

export const POST = route(async () => {
  const s = await getSession();
  if (s) await audit({ id: s.user.id, email: s.user.email }, "auth.logout");
  await destroySession();
  return json({ ok: true });
});
