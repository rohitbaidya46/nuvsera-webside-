"use client";
/** three.js-dependent helpers shared by every 3D scene (environment, brand colours) + re-exported state. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export * from "./state";

/** A procedurally generated studio HDR environment (no network request), shared by every scene and renderer. */
const envCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();
export function studioEnvironment(gl: THREE.WebGLRenderer) {
  let tex = envCache.get(gl);
  if (!tex) {
    const pmrem = new THREE.PMREMGenerator(gl);
    tex = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    pmrem.dispose();
    envCache.set(gl, tex);
  }
  return tex;
}

/** Brand PBR materials (gold: metalness 0.9 / roughness 0.25 as specified). */
export const BRAND = {
  gold: "#E3A93B",
  goldLight: "#F7D488",
  goldDeep: "#B9822A",
  blue: "#3D6BFF",
  ivory: "#F4EBD9",
  steel: "#1A2130",
  bg: "#0A0E16",
};
