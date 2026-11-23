import "server-only";
import { cache } from "react";
import { prisma } from "./db";

export type ProcessStep = { title: string; description: string };
export type FaqItem = { question: string; answer: string };

export const getServices = cache(() =>
  prisma.service.findMany({ where: { published: true }, orderBy: { order: "asc" } }).catch(() => []),
);

export const getService = cache((slug: string) =>
  prisma.service.findFirst({ where: { slug, published: true } }),
);

export const getPage = cache((slug: string) => prisma.page.findUnique({ where: { slug } }).catch(() => null));

const livePost = () => ({
  OR: [{ status: "PUBLISHED" as const }, { status: "SCHEDULED" as const, publishedAt: { lte: new Date() } }],
});

export const getPosts = cache((opts: { category?: string; tag?: string; take?: number; skip?: number } = {}) =>
  prisma.blogPost.findMany({
    where: {
      ...livePost(),
      ...(opts.category ? { category: { slug: opts.category } } : {}),
      ...(opts.tag ? { tags: { some: { slug: opts.tag } } } : {}),
    },
    include: { category: true, tags: true },
    orderBy: { publishedAt: "desc" },
    take: opts.take,
    skip: opts.skip,
  }),
);

export const countPosts = cache((category?: string, tag?: string) =>
  prisma.blogPost.count({
    where: { ...livePost(), ...(category ? { category: { slug: category } } : {}), ...(tag ? { tags: { some: { slug: tag } } } : {}) },
  }),
);

export const getPost = cache((slug: string) =>
  prisma.blogPost.findFirst({ where: { slug, ...livePost() }, include: { category: true, tags: true } }),
);

export const getCategories = cache(() =>
  prisma.blogCategory.findMany({ where: { posts: { some: livePost() } }, orderBy: { name: "asc" } }),
);

export const getJobs = cache(() =>
  prisma.job.findMany({
    where: { published: true, OR: [{ closesAt: null }, { closesAt: { gte: new Date() } }] },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  }),
);

export const getJob = cache((slug: string) =>
  prisma.job.findFirst({ where: { slug, published: true, OR: [{ closesAt: null }, { closesAt: { gte: new Date() } }] } }),
);

export const getCaseStudies = cache(() =>
  prisma.caseStudy.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
);

export const getCaseStudy = cache((slug: string) => prisma.caseStudy.findFirst({ where: { slug, published: true } }));

/** Only testimonials that an admin has approved AND confirmed written permission for. */
export const getTestimonials = cache(() =>
  prisma.testimonial
    .findMany({ where: { approved: true, permissionOnFile: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] })
    .catch(() => []),
);

export const getFaqs = cache((category: string) =>
  prisma.faq.findMany({ where: { category, published: true }, orderBy: { order: "asc" } }).catch(() => []),
);

export const getTeam = cache(() =>
  prisma.teamMember.findMany({ where: { published: true }, orderBy: { order: "asc" } }).catch(() => []),
);

export function readingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
