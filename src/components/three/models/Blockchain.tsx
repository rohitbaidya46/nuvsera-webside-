"use client";
import { Edges, Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { GlassMaterial, GoldMaterial } from "../materials";
import { BRAND, type Quality } from "../runtime";

const CUBES: [number, number, number][] = [
  [-1.75, -0.35, -0.3],
  [-0.85, 0.3, 0.2],
  [0.1, -0.15, -0.1],
  [1.0, 0.45, 0.25],
  [1.8, -0.25, -0.25],
];

/** A gold chain of alternating oval links between two points. */
function Chain({ from, to, quality }: { from: THREE.Vector3; to: THREE.Vector3; quality: Quality }) {
  const { links, quat, mid } = useMemo(() => {
    const dir = to.clone().sub(from);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.clone().normalize());
    const step = 0.13;
    const gap = 0.36; // leave the cube faces clear
    const count = Math.max(2, Math.floor((len - gap * 2) / step));
    const start = -((count - 1) * step) / 2;
    return { links: Array.from({ length: count }, (_, i) => start + i * step), quat: q, mid: from.clone().add(to).multiplyScalar(0.5) };
  }, [from, to]);
  return (
    <group position={mid} quaternion={quat}>
      {links.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[i % 2 ? Math.PI / 2 : 0, 0, 0]} scale={[1.55, 1, 1]}>
          <torusGeometry args={[0.05, 0.013, 8, 20]} />
          <GoldMaterial quality={quality} />
        </mesh>
      ))}
    </group>
  );
}

/** Floating translucent glass blocks linked by thin gold chains, each holding a small gold core. */
export function Blockchain({ quality = "high" }: { quality?: Quality }) {
  const group = useRef<THREE.Group>(null);
  const vecs = useMemo(() => CUBES.map((p) => new THREE.Vector3(...p)), []);
  useFrame((state, dt) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 0.25) * 0.25, 2, dt);
  });
  return (
    <group ref={group} scale={0.92}>
      {vecs.map((v, i) => (
        <Float key={i} speed={1.2} rotationIntensity={0.35} floatIntensity={0.25} floatingRange={[-0.04, 0.04]}>
          <group position={v} rotation={[0.35 * i, 0.6 * i, 0.15]}>
            <RoundedBox args={[0.56, 0.56, 0.56]} radius={0.05} smoothness={3}>
              <GlassMaterial quality={quality} />
            </RoundedBox>
            {/* Gold edge lines (on an invisible box so the rounded glass keeps its soft corners) */}
            <mesh>
              <boxGeometry args={[0.545, 0.545, 0.545]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              <Edges color={BRAND.goldLight} transparent opacity={0.85} />
            </mesh>
            <mesh scale={0.14} rotation={[0.6, 0.8, 0]}>
              <octahedronGeometry args={[1, 0]} />
              <GoldMaterial quality={quality} />
            </mesh>
          </group>
        </Float>
      ))}
      {vecs.slice(1).map((v, i) => (
        <Chain key={i} from={vecs[i]} to={v} quality={quality} />
      ))}
    </group>
  );
}
