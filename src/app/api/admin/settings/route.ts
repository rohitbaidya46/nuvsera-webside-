import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { audit, diff } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { json, route } from "@/lib/http";
import { getSettings, publicSettings, saveSettings, settingsSchema } from "@/lib/settings";

export const GET = route(async () => {
  await requireApi("settings.manage");
  return json({ ok: true, settings: publicSettings(await getSettings()) });
});

const body = settingsSchema.extend({
  email: settingsSchema.shape.email.omit({ smtpPassEnc: true }),
  smtpPassword: z.string().max(500).optional(), // write-only: blank = keep, "__clear__" = remove
});

export const PUT = route(async (req: Request) => {
  const actor = await requireApi("settings.manage");
  const { smtpPassword, ...input } = body.parse(await req.json());
  const current = await getSettings();
  let smtpPassEnc = current.email.smtpPassEnc;
  if (smtpPassword === "__clear__") smtpPassEnc = "";
  else if (smtpPassword) smtpPassEnc = encrypt(smtpPassword);
  const next = settingsSchema.parse({ ...input, email: { ...input.email, smtpPassEnc } });
  await saveSettings(next);
  const changes = diff(
    { ...current, email: { ...current.email, smtpPassEnc: current.email.smtpPassEnc ? "set" : "" } } as Record<string, unknown>,
    { ...next, email: { ...next.email, smtpPassEnc: next.email.smtpPassEnc ? "set" : "" } } as Record<string, unknown>,
  );
  await audit(actor, "settings.update", { entity: "settings", details: { changed: Object.keys(changes), passwordChanged: !!smtpPassword } as Prisma.InputJsonValue });
  return json({ ok: true });
});
