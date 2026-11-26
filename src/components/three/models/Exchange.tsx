"use client";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { GoldMaterial } from "../materials";
import { BRAND, scroll, type Quality } from "../runtime";

const STACKS: { x: number; z: number; n: number }[] = [
  { x: -0.75, z: 0.35, n: 6 },
  { x: 0.05, z: 0.55, n: 9 },
  { x: 0.85, z: 0.3, n: 4 },
];

function Coin({ quality }: { quality: Quality }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.075, 64]} />
        <GoldMaterial quality={quality} />
      </mesh>
      <mesh position={[0, 0.039, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.33, 0.012, 8, 64]} />
        <GoldMaterial quality={quality} color={BRAND.goldDeep} />
      </mesh>
    </group>
  );
}

/** Abstract gold coin stacks in front of a blue candlestick-chart hologram (NS Exchange / fintech). */
export function Exchange({ quality = "high", scrollKey = "exchange" }: { quality?: Quality; scrollKey?: string }) {
  const group = useRef<THREE.Group>(null);
  const candlesRef = useRef<THREE.Group>(null);
  const candles = useMemo(() => {
    let v = 0.6;
    let seed = 3;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 12 }, (_, i) => {
      const open = v;
      v = Math.max(0.25, Math.min(1.6, v + (rnd() - 0.38) * 0.45));
      const close = v;
      const hi = Math.max(open, close) + rnd() * 0.18;
      const lo = Math.min(open, close) - rnd() * 0.18;
      return { x: -1.65 + i * 0.3, open, close, hi, lo, up: close >= open };
    });
  }, []);
  const line = useMemo(() => candles.map((c) => new THREE.Vector3(c.x, c.close + 0.15, 0)), [candles]);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = scroll[scrollKey] ?? 0;
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.5 + p * 1.0 + Math.sin(t * 0.3) * 0.08, 3, dt);
    }
    if (candlesRef.current) candlesRef.current.position.y = -0.2 + Math.sin(t * 1.2) * 0.03;
  });
  const holo = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false } as const;
  return (
    <group ref={group} position={[0, -0.4, 0]} scale={0.85}>
      {/* Hologram */}
      <group ref={candlesRef} position={[0, -0.2, -0.75]}>
        {candles.map((c, i) => (
          <group key={i} position={[c.x, 0, 0]}>
            <mesh position={[0, (c.hi + c.lo) / 2, 0]}>
              <boxGeometry args={[0.018, c.hi - c.lo, 0.018]} />
              <meshBasicMaterial color={BRAND.blue} opacity={0.7} {...holo} />
            </mesh>
            <mesh position={[0, (c.open + c.close) / 2, 0]}>
              <boxGeometry args={[0.15, Math.max(0.05, Math.abs(c.close - c.open)), 0.15]} />
              <meshBasicMaterial color={c.up ? "#5b84ff" : "#2a3f8f"} opacity={c.up ? 0.75 : 0.5} {...holo} />
            </mesh>
          </group>
        ))}
        <Line points={line} color="#8fa8ff" lineWidth={1.6} transparent opacity={0.85} />
        {/* Grid floor of the hologram */}
        {[0.3, 0.7, 1.1, 1.5].map((y) => (
          <mesh key={y} position={[0, y, -0.12]}>
            <planeGeometry args={[3.7, 0.006]} />
            <meshBasicMaterial color={BRAND.blue} opacity={0.25} {...holo} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -0.25, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.6, 96]} />
        <meshBasicMaterial color={BRAND.blue} opacity={0.5} {...holo} side={THREE.DoubleSide} />
      </mesh>
      {/* Coin stacks */}
      {STACKS.map((s, si) => (
        <group key={si} position={[s.x, -0.2, s.z]}>
          {Array.from({ length: s.n }, (_, i) => (
            <group key={i} position={[Math.sin(i * 2.1 + si) * 0.025, i * 0.08, Math.cos(i * 1.7 + si) * 0.025]} rotation={[0, i * 0.4, 0]}>
              <Coin quality={quality} />
            </group>
          ))}
        </group>
      ))}
      {/* One coin standing on its edge */}
      <group position={[1.25, 0.2, 0.85]} rotation={[Math.PI / 2, 0, -0.5]}>
        <Coin quality={quality} />
      </group>
    </group>
  );
}
