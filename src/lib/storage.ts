import { promises as fs } from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env";

/**
 * Storage abstraction. Keys are prefixed:
 *   public/…   – served by /media/[...key] (images)
 *   private/…  – only via authenticated admin download routes (CVs, attachments, backups)
 * Driver "local" writes to UPLOAD_DIR (mount a volume in Docker); driver "s3" writes to an S3 bucket.
 */
const LOCAL_ROOT = path.resolve(process.env.UPLOAD_DIR || "./uploads");

let s3: S3Client | null = null;
function client() {
  if (!s3) s3 = new S3Client({ region: process.env.S3_REGION || "ap-south-1" });
  return s3;
}
const bucket = () => {
  const b = process.env.S3_BUCKET;
  if (!b) throw new Error("S3_BUCKET is not configured");
  return b;
};

function safeLocalPath(key: string) {
  if (!/^(public|private)\/[A-Za-z0-9/_.-]+$/.test(key) || key.includes("..")) throw new Error("Invalid storage key");
  const p = path.join(LOCAL_ROOT, key);
  if (!p.startsWith(LOCAL_ROOT + path.sep)) throw new Error("Invalid storage key");
  return p;
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  if (env.storageDriver === "s3") {
    await client().send(
      new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType, ServerSideEncryption: "AES256" }),
    );
    return;
  }
  const p = safeLocalPath(key);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, body);
}

export async function getObject(key: string): Promise<Buffer | null> {
  try {
    if (env.storageDriver === "s3") {
      const res = await client().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
      const bytes = await res.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    }
    return await fs.readFile(safeLocalPath(key));
  } catch {
    return null;
  }
}

export async function deleteObject(key: string) {
  try {
    if (env.storageDriver === "s3") await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
    else await fs.unlink(safeLocalPath(key));
  } catch {
    /* already gone */
  }
}

export function publicUrl(key: string) {
  return `/media/${key.replace(/^public\//, "")}`;
}
