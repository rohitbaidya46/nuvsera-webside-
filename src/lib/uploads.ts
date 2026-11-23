import { randomBytes } from "node:crypto";
import { HttpError } from "./http";

export const MAX_DOC_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const DOC_TYPES: Record<string, { ext: string; mime: string; check: (b: Buffer) => boolean }> = {
  pdf: { ext: "pdf", mime: "application/pdf", check: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  doc: {
    ext: "doc",
    mime: "application/msword",
    check: (b) => b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  },
  docx: {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    check: (b) => b[0] === 0x50 && b[1] === 0x4b && b.includes(Buffer.from("word/")),
  },
};

/** Validates a PDF/DOC/DOCX upload by extension AND file signature (never trust the browser's MIME type). */
export async function readDocument(file: File | null, label = "File") {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_DOC_BYTES) throw new HttpError(422, `${label} must be 10 MB or smaller.`);
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const type = DOC_TYPES[ext];
  if (!type) throw new HttpError(422, `${label} must be a PDF, DOC or DOCX file.`);
  const buf = Buffer.from(await file.arrayBuffer());
  if (!type.check(buf)) throw new HttpError(422, `${label} does not look like a valid ${ext.toUpperCase()} file.`);
  const safeName = file.name.replace(/[^A-Za-z0-9._ -]/g, "_").slice(-120);
  return { buffer: buf, ext: type.ext, mime: type.mime, name: safeName, size: file.size };
}

export function storageKey(prefix: string, ext: string) {
  const d = new Date();
  const ym = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${prefix}/${ym}/${randomBytes(12).toString("hex")}.${ext}`;
}

export function mimeForExt(ext: string) {
  return (
    { pdf: "application/pdf", doc: "application/msword", docx: DOC_TYPES.docx.mime, webp: "image/webp", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", json: "application/json", gz: "application/gzip" }[ext] ||
    "application/octet-stream"
  );
}
