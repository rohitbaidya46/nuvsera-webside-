"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ModelKey } from "./Scene";
import type { OrbitIcon } from "./models/TechOrbit";
import { getQuality, useViewsReady, type Quality } from "./state";

const Inner = dynamic(() => import("./ModelViewInner"), { ssr: false });

/**
 * A 3D model placed in the page flow. Shows a pre-rendered still until the model is near the viewport and the
 * shared canvas is ready (lazy-loaded below the fold); visitors with reduced motion, Save-Data or no WebGL keep
 * the still image.
 */
export function ModelView({ model, url, className = "", alt, scrollKey, icons, z, eager = false }: { model: ModelKey; url?: string; className?: string; alt: string; scrollKey?: string; icons?: OrbitIcon[]; z?: number; /** Load the still immediately (near the top of the page). */ eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [near, setNear] = useState(false);
  const ready = useViewsReady();
  useEffect(() => setQuality(getQuality()), []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const live = !!quality && quality !== "off" && near && ready;
  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/3d/${model}.webp`}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ${live ? "opacity-0" : "opacity-100"}`}
      />
      {live && <Inner model={model} quality={quality} url={url} scrollKey={scrollKey} icons={icons} z={z} />}
      {live && <span className="sr-only">{alt}</span>}
    </div>
  );
}
