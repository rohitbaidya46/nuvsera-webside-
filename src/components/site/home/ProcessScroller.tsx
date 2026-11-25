"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type Step = { title: string; text: string };

/**
 * Discover → Design → Build → Secure → Launch. On desktop the section pins and the steps travel
 * horizontally while a gold line draws across; on mobile / reduced motion it is a vertical timeline.
 */
export function ProcessScroller({ steps, heading }: { steps: Step[]; heading: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    const tr = track.current;
    if (!el || !tr) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => Math.max(0, tr.scrollWidth - el.clientWidth + 64);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance() + window.innerHeight * 0.4}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      tl.to(tr, { x: () => -distance(), ease: "none", duration: 1 }, 0).fromTo(line.current, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
      // Each step lights up as the gold line reaches its marker.
      tr.querySelectorAll<HTMLElement>("[data-step]").forEach((s, i) => {
        tl.fromTo(s, { opacity: 0.3 }, { opacity: 1, duration: 0.08, ease: "none" }, Math.max(0, i / (steps.length - 1) - 0.08));
      });
      return () => tl.kill();
    });
    return () => mm.revert();
  }, [steps.length]);
  return (
    <div ref={wrap} className="relative flex min-h-screen flex-col justify-center overflow-hidden py-20 lg:py-0">
      <div className="container-x">{heading}</div>
      <div className="relative mt-14 lg:mt-20">
        <div ref={track} className="container-x relative lg:w-max lg:max-w-none lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {/* Rail + gold progress line travel with the steps, running from the first marker to the last */}
        <div className="absolute left-[max(2rem,calc((100vw-80rem)/2+2rem))] right-[calc(32rem-3.5rem)] top-[27px] hidden h-px bg-white/10 lg:block" aria-hidden />
        <div ref={line} className="absolute left-[max(2rem,calc((100vw-80rem)/2+2rem))] right-[calc(32rem-3.5rem)] top-[27px] hidden h-px origin-left bg-gradient-to-r from-gold-700 via-gold to-gold-300 lg:block" aria-hidden />
        <ol className="relative grid gap-10 lg:flex lg:gap-0">
          {steps.map((s, i) => (
            <li key={s.title} data-step data-reveal className="relative pl-16 lg:w-[30rem] lg:pl-0 lg:pr-20">
              <div className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 bg-navy font-display text-lg text-gold lg:relative">
                {String(i + 1).padStart(2, "0")}
              </div>
              {i < steps.length - 1 && <div className="absolute bottom-[-2.5rem] left-7 top-14 w-px bg-gradient-to-b from-gold/50 to-transparent lg:hidden" aria-hidden />}
              <h3 className="font-display text-2xl tracking-[0.06em] text-ivory lg:mt-8 lg:text-3xl">{s.title}</h3>
              <p className="mt-3 max-w-sm leading-7 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        </div>
      </div>
    </div>
  );
}
