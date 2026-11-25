"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { loadGsap } from "@/components/experience/gsap";
import { LogoMark } from "@/components/site/Logo";
import { getQuality, intro, introTime, scroll, skipIntro, startIntro, type Quality } from "@/components/three/state";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

/**
 * Hero background: the 3D gold crest (tilts toward the mouse, idles with a slow spin, rotates away as you
 * scroll) over a field of gold dust. Until WebGL is ready — or permanently for reduced motion / low-power
 * devices — a crisp vector crest is shown in the same place.
 */
export function HeroVisual({ modelUrl, cinematic = false }: { modelUrl?: string; cinematic?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playIntro = useRef(false);

  useEffect(() => {
    const q = getQuality();
    if (q === "off") return;
    // The cinematic intro plays once per visit, on the home page only.
    try {
      playIntro.current = cinematic && !sessionStorage.getItem("nv_intro");
      if (playIntro.current) sessionStorage.setItem("nv_intro", "1");
    } catch {
      playIntro.current = false;
    }
    const id = window.setTimeout(() => setQuality(q), playIntro.current ? 0 : 250);
    return () => window.clearTimeout(id);
  }, [cinematic]);

  // Any scroll, key press or tap skips the intro; it also ends by itself.
  useEffect(() => {
    if (!playing) return;
    const skip = () => skipIntro();
    const opts = { passive: true, once: true } as const;
    addEventListener("wheel", skip, opts);
    addEventListener("touchmove", skip, opts);
    addEventListener("keydown", skip, { once: true });
    const id = window.setInterval(() => !Number.isFinite(introTime()) && setPlaying(false), 200);
    return () => {
      removeEventListener("wheel", skip);
      removeEventListener("touchmove", skip);
      removeEventListener("keydown", skip);
      window.clearInterval(id);
    };
  }, [playing]);

  const onReady = () => {
    if (playIntro.current) {
      startIntro();
      setPlaying(true);
    }
    window.setTimeout(() => setReady(true), playIntro.current ? 0 : 150);
  };

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    let dead = false;
    let kill = () => {};
    loadGsap().then(({ ScrollTrigger }) => {
      if (dead) return;
      const st = ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => (scroll.hero = s.progress) });
      kill = () => st.kill();
    });
    return () => {
      dead = true;
      kill();
      scroll.hero = 0;
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      <div aria-hidden className={`absolute inset-0 transition-opacity duration-[1600ms] ${ready ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 lg:left-[72%] lg:top-1/2">
          <div className="absolute inset-0 -m-16 rounded-full bg-gold/10 blur-3xl" />
          <LogoMark className="relative h-56 w-56 drop-shadow-[0_20px_60px_rgba(227,169,59,0.35)] sm:h-72 sm:w-72 lg:h-[26rem] lg:w-[26rem]" />
        </div>
      </div>
      {quality && <HeroCanvas quality={quality} url={modelUrl} onReady={onReady} />}
      {playing && intro.active && (
        <button
          type="button"
          onClick={() => skipIntro()}
          className="absolute bottom-24 right-6 z-20 rounded-full border border-ivory/20 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-ivory/70 transition hover:border-gold hover:text-gold lg:bottom-10 lg:right-24"
        >
          Skip intro
        </button>
      )}
    </div>
  );
}
