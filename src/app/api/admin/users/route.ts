import { after } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { assertRole, hashPassword, requireApi } from "@/lib/auth";
import { randomToken, sha256 } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { button, layout } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { HttpError, json, route } from "@/lib/http";
import { plain } from "@/lib/sanitize";
import { getSettings } from "@/lib/settings";
import { ROLE_LABELS } from "@/lib/permissions";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(200),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "SALES", "CONTENT_EDITOR"]),
});

/** Creates a user and emails a one-time invitation link (valid 48h) to set their password. */
export const POST = route(async (req: Request) => {
  const actor = await requireApi("users.manage");
  const d = schema.parse(await req.json());
  assertRole(actor, d.role);
  if (await prisma.user.findUnique({ where: { email: d.email } })) throw new HttpError(409, "A user with this email already exists.", { email: "Already exists" });
  const user = await prisma.user.create({
    data: { name: plain(d.name), email: d.email, role: d.role, passwordHash: await hashPassword(randomToken(32)), mustChangePassword: false },
  });
  const token = randomToken(32);
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 48 * 3600 * 1000) } });
  const link = `${env.appUrl}/admin/reset-password?token=${token}`;
  after(async () => {
    const s = await getSettings();
    await sendMail({
      to: user.email,
      subject: "You have been invited to the Nuvsera admin panel",
      html: layout(s, { preheader: "Set your password", title: `Welcome, ${user.name.split(" ")[0]}`, bodyHtml: `<p>${actor.name} has created an admin account for you with the role <strong>${ROLE_LABELS[user.role]}</strong>. Set your password using the link below (valid for 48 hours). You will then set up two-factor authentication.</p>${button(link, "Set my password")}` }),
      text: `You have been invited to the Nuvsera admin panel as ${ROLE_LABELS[user.role]}. Set your password (valid 48h): ${link}`,
    });
  });
  await audit(actor, "user.create", { entity: "user", entityId: user.id, details: { email: user.email, role: user.role } });
  return json({ ok: true, inviteLink: link });
});
