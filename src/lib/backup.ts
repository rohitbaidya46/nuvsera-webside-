import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import { prisma } from "./db";
import { env } from "./env";
import { deleteObject, putObject } from "./storage";

/**
 * Application-level logical backup: every business table exported to JSON, gzipped and
 * encrypted with AES-256-GCM (ENCRYPTION_KEY), stored under private/backups/.
 * Complements (does not replace) database-level backups such as pg_dump / RDS snapshots.
 */
const TABLES = [
  "user", "auditLog", "lead", "leadNote", "leadReminder", "leadEmail", "leadActivity", "subscriber", "consentRecord",
  "page", "service", "caseStudy", "blogCategory", "blogTag", "blogPost", "teamMember", "job", "jobApplication",
  "testimonial", "faq", "media", "setting",
] as const;

type Model = { findMany: (a?: unknown) => Promise<unknown[]> };

export async function createBackup(trigger: "cron" | "manual") {
  const started = new Date();
  try {
    const data: Record<string, unknown> = { version: 1, createdAt: started.toISOString() };
    for (const t of TABLES) {
      const m = (prisma as unknown as Record<string, Model>)[t];
      data[t] = t === "blogPost" ? await m.findMany({ include: { tags: { select: { id: true } } } }) : await m.findMany();
    }
    const gz = gzipSync(Buffer.from(JSON.stringify(data)));
    const iv = randomBytes(12);
    const c = createCipheriv("aes-256-gcm", env.encryptionKey, iv);
    const enc = Buffer.concat([Buffer.from("NVBK1"), iv, c.update(gz), c.final(), c.getAuthTag()]);
    const key = `private/backups/backup-${started.toISOString().replace(/[:.]/g, "-")}.json.gz.enc`;
    await putObject(key, enc, "application/octet-stream");
    const rec = await prisma.backup.create({ data: { key, size: enc.length, trigger, status: "SUCCESS" } });
    await pruneBackups();
    return rec;
  } catch (err) {
    console.error("[backup] failed", err);
    return prisma.backup.create({ data: { key: "", size: 0, trigger, status: "FAILED", error: err instanceof Error ? err.message.slice(0, 500) : "unknown" } });
  }
}

export function decryptBackup(buf: Buffer): Buffer {
  if (buf.subarray(0, 5).toString() !== "NVBK1") throw new Error("Not a Nuvsera backup file");
  const iv = buf.subarray(5, 17);
  const tag = buf.subarray(buf.length - 16);
  const d = createDecipheriv("aes-256-gcm", env.encryptionKey, iv);
  d.setAuthTag(tag);
  return gunzipSync(Buffer.concat([d.update(buf.subarray(17, buf.length - 16)), d.final()]));
}

async function pruneBackups() {
  const days = Number(process.env.BACKUP_RETENTION_DAYS || 30);
  const old = await prisma.backup.findMany({ where: { createdAt: { lt: new Date(Date.now() - days * 86400000) } } });
  for (const b of old) {
    if (b.key) await deleteObject(b.key);
    await prisma.backup.delete({ where: { id: b.id } });
  }
}
