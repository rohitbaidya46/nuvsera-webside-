"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { loadGsap } from "@/components/experience/gsap";
import { scroll } from "@/components/three/state";

/**
 * Pins its content on large screens while the visitor scrolls through it; the scroll progress (0…1) is
 * published to the 3D scene named `scrollKey`, which rotates/morphs with it (ScrollTrigger scrub).
 * On small screens and with reduced motion the section simply scrolls, and progress follows its position.
 */
export function PinnedScene({ children, scrollKey, length = 1, className = "" }: { children: ReactNode; scrollKey: string; length?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let dead = false;
    let revert = () => {};
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (dead) return;
      const mm = gsap.matchMedia();
      revert = () => mm.revert();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({ trigger: el, start: "top top", end: `+=${Math.round(length * 100)}%`, pin: true, scrub: 0.6, onUpdate: (s) => (scroll[scrollKey] = s.progress) });
        return () => st.kill();
      });
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        const st = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", scrub: true, onUpdate: (s) => (scroll[scrollKey] = s.progress) });
        return () => st.kill();
      });
    });
    return () => {
      dead = true;
      revert();
    };
  }, [scrollKey, length]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
