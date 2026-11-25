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
    // Manual override for testing and for rendering stills: ?3d=high|lite|off (remembered for the visit).
    const forced = new URLSearchParams(location.search).get("3d") || sessionStorage.getItem("nv_3d");
    if (forced === "high" || forced === "lite" || forced === "off") {
      sessionStorage.setItem("nv_3d", forced);
      return forced;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData) return "off";
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return "off";
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "off";
    // Software rasterisers (no GPU acceleration) make real-time 3D stutter and block the page: use stills.
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) return "off";
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

/**
 * Cinematic intro clock (home page, first visit). Scenes read introTime(): seconds since the intro started,
 * or Infinity when no intro is playing. skipIntro() jumps straight to the final frame.
 */
export const INTRO_DURATION = 6.5;
export const intro = { start: -1, active: false };
export function startIntro() {
  intro.start = performance.now();
  intro.active = true;
}
export function skipIntro() {
  if (intro.active) intro.start = performance.now() - INTRO_DURATION * 1000;
}
export function introTime() {
  if (!intro.active) return Infinity;
  const t = (performance.now() - intro.start) / 1000;
  if (t >= INTRO_DURATION + 0.5) {
    intro.active = false;
    return Infinity;
  }
  return t;
}
/** 0…1 progress of a segment [a, b] of the intro, eased (easeInOutCubic). 1 when no intro is playing. */
export function introSeg(t: number, a: number, b: number) {
  if (!Number.isFinite(t)) return 1;
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
