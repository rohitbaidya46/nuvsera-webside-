"use client";
import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Crest } from "./Crest";
import { pointer, type Quality } from "../runtime";

export type OrbitIcon = { name: string; path?: string };

function iconTexture(icon: OrbitIcon) {
  const c = document.createElement("canvas");
  c.width = c.height = 192;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(17,23,38,0.9)";
  g.beginPath();
  g.arc(96, 96, 90, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(227,169,59,0.75)";
  g.lineWidth = 4;
  g.stroke();
  const grd = g.createLinearGradient(40, 40, 152, 152);
  grd.addColorStop(0, "#F7D488");
  grd.addColorStop(0.5, "#E3A93B");
  grd.addColorStop(1, "#B9822A");
  g.fillStyle = grd;
  if (icon.path) {
    g.save();
    g.translate(48, 48);
    g.scale(4, 4); // simple-icons are 24×24
    g.fill(new Path2D(icon.path));
    g.restore();
  } else {
    g.font = "600 44px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(icon.name.slice(0, 3).toUpperCase(), 96, 100);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Technology logos orbiting a small crest on two tilted rings; the orbit tilts toward the mouse. */
export function TechOrbit({ icons, quality = "high" }: { icons: OrbitIcon[]; quality?: Quality }) {
  const group = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group[]>([]);
  const textures = useMemo(() => icons.map(iconTexture), [icons]);
  const half = Math.ceil(icons.length / 2);
  useFrame((_, dt) => {
    rings.current.forEach((r, i) => r && (r.rotation.y += dt * (i ? -0.12 : 0.16)));
    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.32 - pointer.y * 0.25, 3, dt);
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -pointer.x * 0.2, 3, dt);
    }
  });
  const ring = (list: THREE.Texture[], radius: number, idx: number, tilt: number) => (
    <group rotation={[0, 0, tilt]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.004, 6, 160]} />
        <meshBasicMaterial color="#E3A93B" transparent opacity={0.35} />
      </mesh>
      <group ref={(el) => void (el && (rings.current[idx] = el))}>
        {list.map((tex, i) => {
          const a = (i / list.length) * Math.PI * 2;
          return (
            <Billboard key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}>
              <mesh>
                <planeGeometry args={[0.46, 0.46]} />
                <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
              </mesh>
            </Billboard>
          );
        })}
      </group>
    </group>
  );
  return (
    <group ref={group}>
      <group scale={0.42}>
        <Crest quality={quality} />
      </group>
      {ring(textures.slice(0, half), 1.75, 0, 0.12)}
      {ring(textures.slice(half), 2.55, 1, -0.1)}
    </group>
  );
}
