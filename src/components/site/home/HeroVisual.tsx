"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoMark } from "@/components/site/Logo";
import { getQuality, scroll, type Quality } from "@/components/three/state";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

/**
 * Hero background: the 3D gold crest (tilts toward the mouse, idles with a slow spin, rotates away as you
 * scroll) over a field of gold dust. Until WebGL is ready — or permanently for reduced motion / low-power
 * devices — a crisp vector crest is shown in the same place.
 */
export function HeroVisual({ modelUrl }: { modelUrl?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = getQuality();
    if (q === "off") return;
    const id = window.setTimeout(() => setQuality(q), 250);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => (scroll.hero = s.progress) });
    return () => {
      st.kill();
      scroll.hero = 0;
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 lg:left-[72%] lg:top-1/2">
          <div className="absolute inset-0 -m-16 rounded-full bg-gold/10 blur-3xl" />
          <LogoMark className="relative h-56 w-56 drop-shadow-[0_20px_60px_rgba(227,169,59,0.35)] sm:h-72 sm:w-72 lg:h-[26rem] lg:w-[26rem]" />
        </div>
      </div>
      {quality && <HeroCanvas quality={quality} url={modelUrl} onReady={() => window.setTimeout(() => setReady(true), 150)} />}
    </div>
  );
}
