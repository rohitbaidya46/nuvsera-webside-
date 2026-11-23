import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.SITE_INDEXABLE === "true";
  return {
    rules: isProduction
      ? [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/thank-you", "/newsletter/"] }]
      : [{ userAgent: "*", disallow: "/" }], // staging/preview environments are never indexed
    sitemap: `${env.appUrl}/sitemap.xml`,
    host: env.appUrl,
  };
}
