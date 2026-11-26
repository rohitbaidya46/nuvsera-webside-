"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getQuality, type Quality } from "@/components/three/state";
import { Analytics } from "./Analytics";
import { Cursor } from "./Cursor";
import { MotionProvider } from "./MotionProvider";
import { PageTransition } from "./PageTransition";
import { Starfield } from "./Starfield";

const ViewCanvas = dynamic(() => import("@/components/three/ViewCanvas"), { ssr: false });

/** Site-wide interaction layer. The shared WebGL canvas loads only once the browser is idle (protects LCP). */
export function ExperienceLayer() {
  const [quality, setQuality] = useState<Quality | null>(null);
  useEffect(() => {
    const q = getQuality();
    document.documentElement.dataset.quality = q;
    if (q === "off") return;
    const start = () => setQuality(q);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 1200);
    return () => clearTimeout(id);
  }, []);
  return (
    <>
      <MotionProvider />
      <Starfield />
      <Cursor />
      <PageTransition />
      <Analytics />
      {quality && <ViewCanvas quality={quality} />}
    </>
  );
}
