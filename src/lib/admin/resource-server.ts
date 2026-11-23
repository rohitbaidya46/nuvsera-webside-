import "server-only";
import { Prisma } from "@prisma/client";
import { z, type ZodTypeAny } from "zod";
import { prisma } from "../db";
import { HttpError } from "../http";
import { plain, sanitizeRichText } from "../sanitize";
import type { Field, Resource } from "./resources";

type Delegate = {
  findMany: (a: unknown) => Promise<Record<string, unknown>[]>;
  findUnique: (a: unknown) => Promise<Record<string, unknown> | null>;
  create: (a: unknown) => Promise<Record<string, unknown>>;
  update: (a: unknown) => Promise<Record<string, unknown>>;
  delete: (a: unknown) => Promise<Record<string, unknown>>;
  count: (a: unknown) => Promise<number>;
};

export function delegate(r: Resource): Delegate {
  return (prisma as unknown as Record<string, Delegate>)[r.model];
}

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);
const safeUrl = z.string().trim().max(500).refine((v) => /^https?:\/\//i.test(v), "Must start with https://");
const imageUrl = z.string().trim().max(500).refine((v) => v.startsWith("/") || /^https:\/\//i.test(v), "Use a media-library path or an https:// URL");

function fieldSchema(f: Field): ZodTypeAny {
  const max = f.max ?? 10000;
  switch (f.type) {
    case "text":
    case "textarea": {
      const base = z.string().trim().max(max, `Maximum ${max} characters`).transform(plain);
      return f.required ? base.refine((v) => v.length > 0, "Required") : z.preprocess(emptyToNull, base.nullable().optional());
    }
    case "richtext": {
      const base = z.string().max(300_000).transform(sanitizeRichText);
      return f.required ? base.refine((v) => v.replace(/<[^>]+>/g, "").trim().length > 0, "Required") : z.preprocess(emptyToNull, base.nullable().optional());
    }
    case "slug":
      return z.string().trim().toLowerCase().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only");
    case "url":
      return z.preprocess(emptyToNull, safeUrl.nullable().optional());
    case "image":
      return z.preprocess(emptyToNull, imageUrl.nullable().optional());
    case "number":
      if (f.name === "rating") return z.preprocess(emptyToNull, z.coerce.number().int().min(1).max(5).nullable().optional());
      return z.preprocess((v) => (v === "" || v === null ? 0 : v), z.coerce.number().int().min(-100000).max(100000));
    case "boolean":
      return z.boolean().default(false);
    case "select": {
      const values = (f.options ?? []).map((o) => o.value) as [string, ...string[]];
      return f.required ? z.enum(values) : z.preprocess(emptyToNull, z.enum(values).nullable().optional());
    }
    case "multiselect": {
      const values = (f.options ?? []).map((o) => o.value) as [string, ...string[]];
      return z.array(z.enum(values)).max(20).default([]);
    }
    case "datetime":
      return z.preprocess(emptyToNull, z.coerce.date().nullable().optional());
    case "list":
      return z.array(z.string().trim().max(300).transform(plain)).max(50).transform((a) => a.filter(Boolean)).default([]);
    case "tags":
      return z.preprocess(
        (v) => (Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : []),
        z.array(z.string().max(40).transform(plain)).max(20),
      );
    case "category":
      return z.preprocess(emptyToNull, z.string().max(40).nullable().optional());
    case "steps":
      return z.array(z.object({ title: z.string().trim().min(1).max(120).transform(plain), description: z.string().trim().max(1000).transform(plain) })).max(12).default([]);
    case "faqs":
      return z.array(z.object({ question: z.string().trim().min(1).max(250).transform(plain), answer: z.string().trim().min(1).max(2000).transform(plain) })).max(25).default([]);
  }
}

export function resourceSchema(r: Resource) {
  const shape: Record<string, ZodTypeAny> = {};
  for (const f of r.fields) shape[f.name] = fieldSchema(f);
  return z.object(shape);
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

/** Converts validated form values into a Prisma data object (handles relations and model-specific rules). */
export function toPrismaData(r: Resource, values: Record<string, unknown>, mode: "create" | "update") {
  const data: Record<string, unknown> = { ...values };
  if (r.model === "blogPost") {
    const tags = (values.tags as string[]) ?? [];
    const uniq = [...new Map(tags.map((t) => [slugify(t), t])).entries()].filter(([s]) => s);
    data.tags = {
      ...(mode === "update" ? { set: [] } : {}),
      connectOrCreate: uniq.map(([slug, name]) => ({ where: { slug }, create: { slug, name } })),
    };
    if (values.status === "PUBLISHED" && !values.publishedAt) data.publishedAt = new Date();
    if (values.status === "SCHEDULED" && !values.publishedAt) throw new HttpError(422, "Scheduled posts need a publish date.", { publishedAt: "Required for scheduled posts" });
  }
  return data;
}

export function prismaError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    throw new HttpError(409, "That URL slug is already in use.", { slug: "Already in use — choose another" });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") throw new HttpError(404, "Record not found");
  throw err;
}

/** Shapes a DB record into form values for the editor. */
export function toFormValues(r: Resource, rec: Record<string, unknown>) {
  const out: Record<string, unknown> = { id: rec.id };
  for (const f of r.fields) {
    const v = rec[f.name];
    if (f.type === "tags") out[f.name] = ((v as { name: string }[]) ?? []).map((t) => t.name);
    else if (f.type === "datetime") out[f.name] = v ? (v as Date).toISOString() : "";
    else out[f.name] = v ?? (f.type === "boolean" ? false : ["list", "multiselect", "steps", "faqs"].includes(f.type) ? [] : "");
  }
  return out;
}
