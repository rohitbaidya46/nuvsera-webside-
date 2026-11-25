"use client";
/**
 * Lightweight shared state for the 3D layer (no three.js import, so DOM components can use it cheaply).
 * Mutable singletons (not React state) so useFrame loops can read them every frame without re-rendering.
 */
import { useSyncExternalStore } from "react";

/** Pointer position normalised to -1…1 (y up), lerped values are computed by consumers. */
export const pointer = { x: 0, y: 0, lastMove: 0, active: false };

/** Scroll progress values written by ScrollTrigger and read by scenes (0…1). */
export const scroll: Record<string, number> = { hero: 0, exchange: 0 };

let listening = false;
export function listenPointer() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.lastMove = performance.now();
      pointer.active = true;
    },
    { passive: true },
  );
}

/** Seconds since the pointer last moved (∞ before the first move). */
export const idleSeconds = () => (pointer.active ? (performance.now() - pointer.lastMove) / 1000 : Infinity);

export type Quality = "high" | "lite" | "off";

/**
 * high: desktop with a capable GPU. lite: phones/tablets and modest hardware (lower pixel ratio, no bloom,
 * no glass transmission, fewer particles). off: reduced motion, Save-Data, no WebGL or very low memory —
 * static images only.
 */
export function detectQuality(): Quality {
  if (typeof window === "undefined") return "off";
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData) return "off";
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return "off";
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "off";
    const coarse = matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 900;
    const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    return coarse || small || weak ? "lite" : "high";
  } catch {
    return "off";
  }
}

let quality: Quality | null = null;
export function getQuality(): Quality {
  if (quality === null) quality = detectQuality();
  return quality;
}

/** Pixel ratio cap: never above 2 (spec), 1.5 on lite devices. */
export const dprFor = (q: Quality): [number, number] => (q === "high" ? [1, 2] : [1, 1.5]);

/** Becomes true once the shared WebGL canvas for in-page 3D views has been created. */
let viewsReady = false;
const subs = new Set<() => void>();
export function setViewsReady(v: boolean) {
  viewsReady = v;
  subs.forEach((f) => f());
}
export function useViewsReady() {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => viewsReady,
    () => false,
  );
}
