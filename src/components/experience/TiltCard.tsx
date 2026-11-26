"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * 3D tilt on hover (max 8°) with a soft glare highlight that follows the cursor.
 * Fine pointers only; static under reduced motion.
 */
export function TiltCard({ children, className = "", max = 8, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const cur = { rx: 0, ry: 0, gx: 50, gy: 50, o: 0 };
    const tgt = { ...cur };
    const loop = () => {
      for (const k of Object.keys(cur) as (keyof typeof cur)[]) cur[k] += (tgt[k] - cur[k]) * 0.14;
      el.style.transform = `perspective(1000px) rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`;
      if (glareRef.current) {
        glareRef.current.style.opacity = String(cur.o);
        glareRef.current.style.background = `radial-gradient(circle at ${cur.gx}% ${cur.gy}%, rgb(247 212 136 / 0.22), transparent 55%)`;
      }
      const moving = Math.abs(tgt.rx - cur.rx) + Math.abs(tgt.ry - cur.ry) + Math.abs(tgt.o - cur.o) > 0.01;
      if (moving) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      tgt.ry = (px - 0.5) * 2 * max;
      tgt.rx = -(py - 0.5) * 2 * max;
      tgt.gx = px * 100;
      tgt.gy = py * 100;
      tgt.o = 1;
      kick();
    };
    const leave = () => {
      tgt.rx = 0;
      tgt.ry = 0;
      tgt.o = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);
  return (
    <div ref={ref} className={`relative [transform-style:preserve-3d] will-change-transform ${className}`}>
      {children}
      {glare && <div ref={glareRef} aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0" />}
    </div>
  );
}
