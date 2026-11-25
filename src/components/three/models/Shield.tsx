"use client";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Glow, GoldMaterial, SteelMaterial } from "../materials";
import { BRAND, type Quality } from "../runtime";

function outline<T extends THREE.Path>(s: number, path: T): T {
  path.moveTo(0, 1.28 * s);
  path.quadraticCurveTo(0.55 * s, 1.02 * s, 1.08 * s, 1.14 * s);
  path.lineTo(1.08 * s, 0.22 * s);
  path.quadraticCurveTo(1.02 * s, -0.72 * s, 0, -1.38 * s);
  path.quadraticCurveTo(-1.02 * s, -0.72 * s, -1.08 * s, 0.22 * s);
  path.lineTo(-1.08 * s, 1.14 * s);
  path.quadraticCurveTo(-0.55 * s, 1.02 * s, 0, 1.28 * s);
  return path;
}

// Circuit traces engraved on the shield face (right-angled, like PCB routing), mirrored left/right.
const TRACES: [number, number][][] = [
  [[0.3, 0.12], [0.55, 0.12], [0.55, 0.5], [0.78, 0.5]],
  [[0.28, -0.1], [0.62, -0.1], [0.62, -0.38], [0.45, -0.55]],
  [[0.12, 0.3], [0.12, 0.72], [0.4, 0.72]],
  [[0.15, -0.3], [0.15, -0.8]],
  [[0.32, 0.28], [0.38, 0.28], [0.38, 0.95], [0.7, 0.95]],
];

/** Gold-and-dark-steel shield with engraved circuit lines and a glowing blue core. */
export function Shield({ quality = "high" }: { quality?: Quality }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const { body, rim } = useMemo(() => {
    const bodyShape = outline(0.9, new THREE.Shape());
    const rimShape = outline(1, new THREE.Shape());
    rimShape.holes.push(outline(0.9, new THREE.Path()));
    const opts = { bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 3, curveSegments: 24 };
    const b = new THREE.ExtrudeGeometry(bodyShape, { ...opts, depth: 0.16 });
    b.translate(0, 0, -0.08);
    const r = new THREE.ExtrudeGeometry(rimShape, { ...opts, depth: 0.24 });
    r.translate(0, 0, -0.12);
    return { body: b, rim: r };
  }, []);
  const traces = useMemo(
    () => TRACES.flatMap((t) => [t, t.map(([x, y]) => [-x, y] as [number, number])]).map((t) => t.map(([x, y]) => new THREE.Vector3(x, y, 0.115))),
    [],
  );
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, Math.sin(t * 0.35) * 0.45, 2, dt);
    if (core.current) {
      const m = core.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.6 + Math.sin(t * 2.2) * 0.5;
    }
  });
  return (
    <group ref={group} scale={0.95}>
      <mesh geometry={body}>
        <SteelMaterial color="#1b2332" roughness={0.32} />
      </mesh>
      <mesh geometry={rim}>
        <GoldMaterial quality={quality} />
      </mesh>
      {traces.map((pts, i) => (
        <group key={i}>
          <Line points={pts} color={BRAND.gold} lineWidth={1.4} transparent opacity={0.9} />
          <mesh position={pts[pts.length - 1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.02, 16]} />
            <GoldMaterial quality={quality} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.08, 0.11]}>
        <torusGeometry args={[0.32, 0.03, 16, 64]} />
        <GoldMaterial quality={quality} />
      </mesh>
      <mesh ref={core} position={[0, 0.08, 0.12]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={BRAND.blue} emissive={BRAND.blue} emissiveIntensity={1.8} roughness={0.2} toneMapped={false} />
      </mesh>
      <group position={[0, 0.08, 0.3]}>
        <Glow color="#3d6bff" scale={1.4} opacity={0.9} />
      </group>
      <pointLight position={[0, 0.1, 0.6]} color={BRAND.blue} intensity={2.5} distance={3} />
    </group>
  );
}
