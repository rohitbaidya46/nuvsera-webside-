"use client";
import { useEffect, useState } from "react";

export function PreloaderCounter() {
  const [n, setN] = useState(0);
  useEffect(() => {
    try {
      sessionStorage.setItem("nv_seen", "1");
    } catch {
      /* private mode */
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      // Eases to 100 % within 1.8 s; jumps to 100 % as soon as the page has fully loaded.
      const p = Math.min(1, (t - start) / 1800);
      const v = document.readyState === "complete" && p > 0.55 ? 1 : 1 - Math.pow(1 - p, 3);
      setN(Math.round(v * 100));
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <p className="mt-3 font-serif text-2xl tabular-nums text-gold">{n}%</p>;
}
