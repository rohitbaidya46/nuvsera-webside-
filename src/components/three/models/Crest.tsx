"use client";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { N_PATH } from "@/components/site/Logo";
import { GoldMaterial, SteelMaterial } from "../materials";
import { BRAND, idleSeconds, pointer, scroll, type Quality } from "../runtime";

/** Same "N" path as the 2D logo, extruded with a bevel so the 3D and 2D marks always match. */
function useNGeometry() {
  return useMemo(() => {
    const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${N_PATH}"/></svg>`);
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.45, bevelSize: 0.28, bevelSegments: 3, curveSegments: 6 });
    geo.center();
    geo.rotateX(Math.PI); // SVG y points down
    const s = 1.55 / 27.5; // ring radius in SVG units → world units
    geo.scale(s, s, s);
    return geo;
  }, []);
}

/**
 * The hero centrepiece: a gold medallion (double ring, reeded ticks, serif N on both faces, sapphire diamond).
 * `interactive` makes it tilt toward the mouse, spin slowly when the mouse is still, and react to scroll.
 */
export function Crest({ quality = "high", interactive = false, scrollKey }: { quality?: Quality; interactive?: boolean; scrollKey?: string }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const n = useNGeometry();
  const ticks = useMemo(() => {
    const count = 72;
    const m = new THREE.Matrix4();
    const arr: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      m.makeRotationZ(a);
      m.setPosition(Math.cos(a + Math.PI / 2) * 1.452, Math.sin(a + Math.PI / 2) * 1.452, 0);
      arr.push(m.clone());
    }
    return arr;
  }, []);
  const tickRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const im = tickRef.current;
    if (!im) return;
    ticks.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
  }, [ticks]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (!interactive) {
      g.rotation.y = Math.sin(t * 0.4) * 0.35;
      return;
    }
    const idle = idleSeconds() > 1.6;
    // Idle: slow continuous spin. Active: settle facing the viewer and tilt toward the cursor.
    if (idle) spin.current += dt * 0.35;
    else spin.current = THREE.MathUtils.damp(spin.current, Math.round(spin.current / (Math.PI * 2)) * Math.PI * 2, 2.5, dt);
    const p = scrollKey ? scroll[scrollKey] ?? 0 : 0;
    const tx = (idle ? Math.sin(t * 0.5) * 0.06 : -pointer.y * 0.38) + p * 0.9;
    const ty = spin.current + (idle ? 0 : pointer.x * 0.55) + p * 1.2;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 4, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 4, dt);
    g.position.y = Math.sin(t * 0.8) * 0.05 + p * 0.6;
    const sc = 1 - p * 0.35;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, sc, 6, dt));
  });

  const diamondMat = (
    <meshPhysicalMaterial color={BRAND.blue} emissive="#1f3fd6" emissiveIntensity={quality === "high" ? 1.1 : 0.6} metalness={0.15} roughness={0.08} clearcoat={1} envMapIntensity={2} flatShading />
  );

  return (
    <group ref={group}>
      {/* Rings */}
      <mesh>
        <torusGeometry args={[1.55, 0.058, 32, 180]} />
        <GoldMaterial quality={quality} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.355, 0.024, 24, 160]} />
        <GoldMaterial quality={quality} color={BRAND.goldLight} />
      </mesh>
      {/* Reeded ticks between the rings */}
      <instancedMesh ref={tickRef} args={[undefined, undefined, ticks.length]}>
        <boxGeometry args={[0.012, 0.07, 0.03]} />
        <GoldMaterial quality={quality} color={BRAND.goldDeep} roughness={0.35} />
      </instancedMesh>
      {/* Medallion face */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.335, 1.335, 0.11, 96]} />
        <SteelMaterial color="#121826" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0, 0.057]}>
        <torusGeometry args={[1.08, 0.006, 8, 140]} />
        <GoldMaterial quality={quality} color={BRAND.goldDeep} />
      </mesh>
      <mesh position={[0, 0, -0.057]}>
        <torusGeometry args={[1.08, 0.006, 8, 140]} />
        <GoldMaterial quality={quality} color={BRAND.goldDeep} />
      </mesh>
      {/* Serif N, front and back (the back copy is turned so it reads correctly when the crest spins) */}
      <mesh geometry={n} position={[0, 0.05, 0.1]}>
        <GoldMaterial quality={quality} />
      </mesh>
      <mesh geometry={n} position={[0, 0.05, -0.1]} rotation={[0, Math.PI, 0]}>
        <GoldMaterial quality={quality} />
      </mesh>
      {/* Sapphire diamond */}
      <mesh position={[0, 1.76, 0]} scale={[1, 1.35, 1]}>
        <octahedronGeometry args={[0.13, 0]} />
        {diamondMat}
      </mesh>
    </group>
  );
}
