"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Pulls its child toward the cursor while hovered (fine pointers only, off under reduced motion). */
export function Magnetic({ children, strength = 0.35, className = "inline-flex" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const cur = { x: 0, y: 0 };
    const tgt = { x: 0, y: 0 };
    const loop = () => {
      cur.x += (tgt.x - cur.x) * 0.2;
      cur.y += (tgt.y - cur.y) * 0.2;
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      if (Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.1) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tgt.x = (e.clientX - (r.left + r.width / 2)) * strength;
      tgt.y = (e.clientY - (r.top + r.height / 2)) * strength;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const leave = () => {
      tgt.x = 0;
      tgt.y = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <span ref={ref} className={`${className} will-change-transform`}>
      {children}
    </span>
  );
}
