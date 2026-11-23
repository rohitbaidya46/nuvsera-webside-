import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl;
  const now = new Date();
  const staticPaths = ["", "/about", "/services", "/products/ns-exchange", "/portfolio", "/process", "/careers", "/blog", "/contact", "/get-a-quote", "/privacy-policy", "/terms-and-conditions", "/refund-and-cancellation-policy"];
  const [noindex, services, posts, cases, jobs] = await Promise.all([
    prisma.page.findMany({ where: { noindex: true }, select: { slug: true } }),
    prisma.service.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({
      where: { noindex: false, OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", publishedAt: { lte: now } }] },
      select: { slug: true, updatedAt: true },
    }),
    prisma.caseStudy.findMany({ where: { published: true, noindex: false }, select: { slug: true, updatedAt: true } }),
    prisma.job.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const hidden = new Set(noindex.map((p) => (p.slug === "home" ? "" : `/${p.slug}`)));
  return [
    ...staticPaths.filter((p) => !hidden.has(p)).map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...cases.map((c) => ({ url: `${base}/portfolio/${c.slug}`, lastModified: c.updatedAt, priority: 0.6 })),
    ...jobs.map((j) => ({ url: `${base}/careers/${j.slug}`, lastModified: j.updatedAt, priority: 0.5 })),
  ];
}
