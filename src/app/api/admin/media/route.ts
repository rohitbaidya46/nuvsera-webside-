import sharp from "sharp";
import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";
import { plain } from "@/lib/sanitize";
import { publicUrl, putObject } from "@/lib/storage";
import { MAX_IMAGE_BYTES, storageKey } from "@/lib/uploads";

export const runtime = "nodejs";

export const GET = route(async () => {
  await requireApi("media.manage");
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 300, select: { id: true, url: true, alt: true, filename: true, width: true, height: true, size: true, createdAt: true } });
  return json({ ok: true, items });
});

/** Uploads an image, strips metadata (EXIF/GPS), resizes to ≤2000px and converts to WebP. */
export const POST = route(async (req: Request) => {
  const actor = await requireApi("media.manage");
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) throw new HttpError(422, "Choose an image to upload.");
  if (file.size > MAX_IMAGE_BYTES) throw new HttpError(422, "Images must be 8 MB or smaller.");
  const input = Buffer.from(await file.arrayBuffer());
  let meta;
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new HttpError(422, "That file is not a supported image.");
  }
  if (!meta.format || !["jpeg", "png", "webp", "gif", "avif", "heif"].includes(meta.format)) throw new HttpError(422, "Use JPG, PNG, WebP or GIF images.");
  const { data, info } = await sharp(input, { animated: meta.format === "gif" })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const key = storageKey("public/media", "webp");
  await putObject(key, data, "image/webp");
  const item = await prisma.media.create({
    data: {
      key,
      url: publicUrl(key),
      filename: file.name.replace(/[^A-Za-z0-9._ -]/g, "_").slice(-120),
      mimeType: "image/webp",
      size: data.length,
      width: info.width,
      height: info.height,
      alt: plain(String(fd.get("alt") || "")).slice(0, 250),
      uploadedById: actor.id,
    },
  });
  await audit(actor, "media.upload", { entity: "media", entityId: item.id, details: { filename: item.filename, originalBytes: file.size, webpBytes: data.length } });
  return json({ ok: true, item });
});
