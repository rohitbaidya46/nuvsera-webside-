"use client";
import dynamic from "next/dynamic";

const FilmCanvas = dynamic(() => import("@/components/film/FilmCanvas"), { ssr: false });

export function FilmClient({ vertical }: { vertical: boolean }) {
  return <FilmCanvas vertical={vertical} />;
}
