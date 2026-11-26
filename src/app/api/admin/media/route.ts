import sharp from "sharp";
import { audit } from "@/lib/audit";
import { requireApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, json, route } from "@/lib/http";
import { plain } from "@/lib/sanitize";
import { publicUrl, putObject } from "@/lib/storage";
import { MAX_IMAGE_BYTES, MAX_MODEL_BYTES, RECOMMENDED_MODEL_BYTES, isGlb, storageKey } from "@/lib/uploads";

export const runtime = "nodejs";

export const GET = route(async () => {
  await requireApi("media.manage");
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 300, where: { mimeType: { startsWith: "image/" } }, select: { id: true, url: true, alt: true, filename: true, width: true, height: true, size: true, createdAt: true } });
  return json({ ok: true, items });
});

/**
 * Uploads an image (metadata stripped, resized to ≤2000px, converted to WebP; SVG logos are rasterised so no
 * script can ever be served) or a binary glTF (.glb) 3D model, which is stored as-is after a signature check.
 */
export const POST = route(async (req: Request) => {
  const actor = await requireApi("media.manage");
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) throw new HttpError(422, "Choose an image or .glb model to upload.");
  const filename = file.name.replace(/[^A-Za-z0-9._ -]/g, "_").slice(-120);
  if (filename.toLowerCase().endsWith(".glb")) {
    if (file.size > MAX_MODEL_BYTES) throw new HttpError(422, "3D models must be 15 MB or smaller (aim for under 1.5 MB).");
    const buf = Buffer.from(await file.arrayBuffer());
    if (!isGlb(buf)) throw new HttpError(422, "That file is not a valid binary glTF 2.0 (.glb) model.");
    const key = storageKey("public/media", "glb");
    await putObject(key, buf, "model/gltf-binary");
    const item = await prisma.media.create({
      data: { key, url: publicUrl(key), filename, mimeType: "model/gltf-binary", size: buf.length, alt: plain(String(fd.get("alt") || "")).slice(0, 250), uploadedById: actor.id },
    });
    await audit(actor, "media.upload", { entity: "media", entityId: item.id, details: { filename, bytes: buf.length, model: true } });
    return json({ ok: true, item, warning: buf.length > RECOMMENDED_MODEL_BYTES ? "This model is larger than 1.5 MB and may load slowly on mobile. Compress it with Draco or Meshopt." : undefined });
  }
  if (file.size > MAX_IMAGE_BYTES) throw new HttpError(422, "Images must be 8 MB or smaller.");
  const input = Buffer.from(await file.arrayBuffer());
  let meta;
  try {
    meta = await sharp(input, { density: 300 }).metadata();
  } catch {
    throw new HttpError(422, "That file is not a supported image.");
  }
  if (!meta.format || !["jpeg", "png", "webp", "gif", "avif", "heif", "svg"].includes(meta.format)) throw new HttpError(422, "Use JPG, PNG, WebP, GIF or SVG images, or a .glb model.");
  let converted;
  try {
    converted = await sharp(input, { animated: meta.format === "gif", density: meta.format === "svg" ? 300 : undefined })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp(meta.format === "svg" ? { lossless: true } : { quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new HttpError(422, "This image appears to be damaged and could not be processed. Please try another file.");
  }
  const { data, info } = converted;
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
