"use client";
import { useEffect, useRef } from "react";

/**
 * Fixed background field of tiny gold particles in three depth layers. Moves opposite to the mouse (parallax)
 * and drifts slowly with scroll. 2D canvas, ~1 ms per frame; paused when the tab is hidden; static under
 * reduced motion.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    type P = { x: number; y: number; z: number; r: number; tw: number };
    let parts: P[] = [];
    const resize = () => {
      w = innerWidth;
      h = innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(180, (w * h) / 9000));
      parts = Array.from({ length: count }, () => {
        const z = Math.random();
        return { x: Math.random() * w, y: Math.random() * h, z, r: 0.35 + z * 1.05, tw: Math.random() * Math.PI * 2 };
      });
    };
    resize();
    addEventListener("resize", resize);
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      m.tx = e.clientX / w - 0.5;
      m.ty = e.clientY / h - 0.5;
    };
    addEventListener("pointermove", onMove, { passive: true });
    let raf = 0;
    const draw = (t: number) => {
      m.x += (m.tx - m.x) * 0.04;
      m.y += (m.ty - m.y) * 0.04;
      const sy = scrollY;
      g.clearRect(0, 0, w, h);
      for (const p of parts) {
        const depth = 8 + p.z * 38;
        let x = p.x - m.x * depth;
        let y = (p.y - m.y * depth - sy * (0.02 + p.z * 0.06)) % h;
        if (y < 0) y += h;
        x = ((x % w) + w) % w;
        const a = 0.25 + p.z * 0.5 + Math.sin(t * 0.001 + p.tw) * 0.15;
        g.globalAlpha = Math.max(0, a);
        g.fillStyle = p.z > 0.85 ? "#F7D488" : "#E3A93B";
        g.beginPath();
        g.arc(x, y, p.r, 0, Math.PI * 2);
        g.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return <canvas ref={ref} aria-hidden data-starfield className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
