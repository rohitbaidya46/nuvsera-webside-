import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FilmClient } from "./FilmClient";

export const metadata: Metadata = { title: "Brand film", robots: { index: false, follow: false } };

/**
 * Rendering stage for the brand film (scripts/render-film.mjs). Not part of the public site: available in
 * development, or in production only when ENABLE_FILM_ROUTE=true.
 *   /film               16:9 preview (plays automatically)
 *   /film?format=vertical   9:16
 */
export default async function FilmPage({ searchParams }: { searchParams: Promise<{ format?: string }> }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_FILM_ROUTE !== "true") notFound();
  const { format } = await searchParams;
  return <FilmClient vertical={format === "vertical"} />;
}
