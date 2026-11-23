import type { Metadata } from "next";
import { env } from "./env";

type SeoFields = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean | null;
};

export function buildMetadata(
  path: string,
  fallback: { title: string; description: string },
  seo?: SeoFields | null,
  extra: Partial<Metadata> = {},
): Metadata {
  const title = seo?.seoTitle || fallback.title;
  const description = seo?.seoDescription || fallback.description;
  const canonical = seo?.canonicalUrl || `${env.appUrl}${path === "/" ? "" : path}`;
  const image = seo?.ogImage ? absolute(seo.ogImage) : `${env.appUrl}/og-default.png`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Nuvsera Technology",
      type: "website",
      locale: "en_IN",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    ...extra,
  };
}

export function absolute(url: string) {
  return /^https?:\/\//.test(url) ? url : `${env.appUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}
