"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { BRAND, type Quality } from "./runtime";

/** Polished brushed gold (metalness 0.9, roughness 0.25). */
export function GoldMaterial({ quality = "high", color = BRAND.gold, roughness = 0.25 }: { quality?: Quality; color?: string; roughness?: number }) {
  return quality === "high" ? (
    <meshPhysicalMaterial color={color} metalness={0.9} roughness={roughness} clearcoat={0.35} clearcoatRoughness={0.2} anisotropy={0.5} envMapIntensity={1.35} />
  ) : (
    <meshStandardMaterial color={color} metalness={0.9} roughness={roughness} envMapIntensity={1.35} />
  );
}

export function SteelMaterial({ color = BRAND.steel, roughness = 0.38 }: { color?: string; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={0.85} roughness={roughness} envMapIntensity={1} />;
}

/** Glass: real transmission on capable GPUs, a cheaper clear-coated translucent look elsewhere. */
export function GlassMaterial({ quality = "high", tint = "#d7e3ff" }: { quality?: Quality; tint?: string }) {
  return quality === "high" ? (
    <meshPhysicalMaterial color={tint} transmission={1} thickness={0.6} roughness={0.06} ior={1.45} metalness={0} attenuationColor="#7f9cff" attenuationDistance={2.5} clearcoat={1} envMapIntensity={1.2} />
  ) : (
    <meshPhysicalMaterial color={tint} transparent opacity={0.16} roughness={0.04} metalness={0.2} clearcoat={1} envMapIntensity={2.2} depthWrite={false} side={THREE.DoubleSide} />
  );
}

/** Soft additive glow sprite texture (radial gradient), used instead of post-processing bloom in shared views. */
export function useGlowTexture(color = BRAND.blue) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, color);
    grd.addColorStop(0.25, `${color}aa`);
    grd.addColorStop(1, `${color}00`);
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [color]);
}

export function Glow({ color = BRAND.blue, scale = 1, opacity = 1 }: { color?: string; scale?: number; opacity?: number }) {
  const map = useGlowTexture(color);
  return (
    <sprite scale={scale}>
      <spriteMaterial map={map} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

/** Draws a texture on a 2D canvas once (screens, UI panels, logos). */
export function useCanvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[] = []) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d")!, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
