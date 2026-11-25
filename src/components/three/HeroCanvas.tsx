"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Model, SceneRig } from "./Scene";
import { BRAND, dprFor, listenPointer, pointer, type Quality } from "./runtime";

/** Gold dust in two depth layers that drifts opposite to the mouse (parallax). */
function Particles({ count }: { count: number }) {
  const near = useRef<THREE.Points>(null);
  const far = useRef<THREE.Points>(null);
  const [a, b] = useMemo(() => {
    const make = (n: number, zMin: number, zMax: number) => {
      const p = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        p[i * 3] = (Math.random() - 0.5) * 18;
        p[i * 3 + 1] = (Math.random() - 0.5) * 11;
        p[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(p, 3));
      return g;
    };
    return [make(Math.round(count * 0.35), -1, 2.5), make(Math.round(count * 0.65), -8, -1)];
  }, [count]);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (near.current) {
      near.current.position.x = THREE.MathUtils.damp(near.current.position.x, -pointer.x * 0.45, 2.5, dt);
      near.current.position.y = THREE.MathUtils.damp(near.current.position.y, -pointer.y * 0.3, 2.5, dt);
      near.current.rotation.z = t * 0.01;
    }
    if (far.current) {
      far.current.position.x = THREE.MathUtils.damp(far.current.position.x, -pointer.x * 0.15, 2.5, dt);
      far.current.position.y = THREE.MathUtils.damp(far.current.position.y, -pointer.y * 0.1, 2.5, dt);
      far.current.rotation.z = -t * 0.006;
    }
  });
  const mat = (size: number, opacity: number) => (
    <pointsMaterial size={size} color={BRAND.gold} transparent opacity={opacity} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
  );
  return (
    <>
      <points ref={near} geometry={a}>{mat(0.032, 0.9)}</points>
      <points ref={far} geometry={b}>{mat(0.024, 0.6)}</points>
    </>
  );
}

/** A warm light that follows the cursor so reflections slide across the gold. */
function CursorLight() {
  const l = useRef<THREE.PointLight>(null);
  useFrame((_, dt) => {
    if (!l.current) return;
    l.current.position.x = THREE.MathUtils.damp(l.current.position.x, pointer.x * 4, 3, dt);
    l.current.position.y = THREE.MathUtils.damp(l.current.position.y, pointer.y * 3, 3, dt);
  });
  return <pointLight ref={l} position={[0, 0, 3]} intensity={14} distance={9} color="#fff1d0" />;
}

/** Desktop: crest on the right half. Portrait/mobile: centred above the headline. */
function Placement({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const { viewport, size } = useThree();
  useFrame(() => {
    if (!g.current) return;
    const wide = size.width >= 1024;
    g.current.position.set(wide ? viewport.width * 0.24 : 0, wide ? 0.05 : viewport.height * 0.2, 0);
    g.current.scale.setScalar(wide ? Math.min(0.78, viewport.width / 9) : Math.min(0.62, viewport.width / 4.6));
  });
  return <group ref={g}>{children}</group>;
}

export default function HeroCanvas({ quality, url, onReady }: { quality: Quality; url?: string; onReady?: () => void }) {
  useEffect(() => listenPointer(), []);
  return (
    <Canvas
      aria-hidden
      dpr={dprFor(quality)}
      gl={{ antialias: quality !== "high", powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(BRAND.bg);
        onReady?.();
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={[BRAND.bg]} />
      <fog attach="fog" args={[BRAND.bg, 6, 16]} />
      <SceneRig fov={30} z={7} />
      <CursorLight />
      <Particles count={quality === "high" ? 1400 : 500} />
      <Placement>
        <Suspense fallback={null}>
          <Model model="hero" quality={quality} interactive scrollKey="hero" url={url} />
        </Suspense>
      </Placement>
      {quality === "high" && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.55} radius={0.65} />
          <Vignette eskil={false} offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
