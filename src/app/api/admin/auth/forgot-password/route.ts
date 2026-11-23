import { after } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { hashIp, randomToken, sha256 } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { button, layout } from "@/lib/email/templates";
import { env } from "@/lib/env";
import { clientIp, json, route } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";

export const POST = route(async (req: Request) => {
  await enforceRateLimit(`forgot:${hashIp(await clientIp())}`, 5, 3600);
  const { email } = z.object({ email: z.string().trim().toLowerCase().email().max(200) }).parse(await req.json());
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.isActive) {
    const token = randomToken(32);
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    await audit({ id: user.id, email: user.email }, "auth.password.reset_requested");
    const link = `${env.appUrl}/admin/reset-password?token=${token}`;
    after(async () => {
      const s = await getSettings();
      await sendMail({
        to: user.email,
        subject: "Reset your admin password",
        html: layout(s, { preheader: "Password reset link (valid for 1 hour)", title: "Reset your password", bodyHtml: `<p>We received a request to reset the password for your admin account. This link is valid for 1 hour and can be used once.</p>${button(link, "Choose a new password")}<p style="font-size:13px;color:#6b7280">If you did not request this, you can ignore this email — your password will not change.</p>` }),
        text: `Reset your password (valid 1 hour): ${link}\nIf you did not request this, ignore this email.`,
      });
    });
  }
  // Always the same response — never reveal whether an account exists.
  return json({ ok: true });
});
