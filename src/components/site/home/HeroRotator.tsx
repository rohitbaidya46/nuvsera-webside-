"use client";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

/** Cycles hero headlines every 6s. Pausable (WCAG 2.2.2), pauses on hover/focus, static under reduced motion. */
export function HeroRotator({ headlines }: { headlines: string[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useEffect(() => {
    if (headlines.length < 2 || paused || hover || reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % headlines.length), 6000);
    return () => clearInterval(t);
  }, [headlines.length, paused, hover, reduced]);

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <h1 className="h-display min-h-[2.4em] text-white sm:min-h-[2.2em]">
        <span key={i} className="rotate-in block">
          {headlines[i].split(" ").map((w, idx, arr) =>
            idx >= arr.length - 2 ? <span key={idx} className="text-gold">{w}{idx < arr.length - 1 ? " " : ""}</span> : <span key={idx}>{w} </span>,
          )}
        </span>
      </h1>
      {headlines.length > 1 && (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden>
            {headlines.map((_, n) => <span key={n} className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-gold" : "w-1.5 bg-white/30"}`} />)}
          </div>
          <button type="button" onClick={() => setPaused((p) => !p)} className="inline-flex h-8 items-center gap-1 rounded px-2 text-xs text-slate-300 hover:text-white" aria-label={paused ? "Resume rotating headlines" : "Pause rotating headlines"}>
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      )}
    </div>
  );
}
