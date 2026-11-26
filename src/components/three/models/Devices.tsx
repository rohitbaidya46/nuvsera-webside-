"use client";
import { Float, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { GoldMaterial, SteelMaterial, useCanvasTexture } from "../materials";
import { BRAND, type Quality } from "../runtime";

const TOKENS = ["#E3A93B", "#7f9cff", "#F4EBD9", "#8E9AB2", "#F7D488"];

/** Abstract "code" drawn as coloured token bars (no fonts needed). */
function drawCode(g: CanvasRenderingContext2D, w: number, h: number) {
  g.fillStyle = "#0b1020";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#141b2e";
  g.fillRect(0, 0, w, 34);
  ["#ff6b6b", "#E3A93B", "#3fbf7f"].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(22 + i * 22, 17, 6, 0, Math.PI * 2);
    g.fill();
  });
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  let indent = 0;
  for (let y = 58; y < h - 16; y += 22) {
    if (rnd() < 0.2) indent = Math.max(0, indent - 1);
    else if (rnd() < 0.25) indent = Math.min(3, indent + 1);
    let x = 40 + indent * 26;
    g.fillStyle = "#3a4560";
    g.fillRect(12, y, 14, 8);
    const n = 1 + Math.floor(rnd() * 4);
    for (let i = 0; i < n && x < w - 40; i++) {
      const len = 24 + rnd() * 90;
      g.fillStyle = TOKENS[Math.floor(rnd() * TOKENS.length)];
      g.globalAlpha = 0.85;
      g.fillRect(x, y, len, 8);
      x += len + 10;
    }
    g.globalAlpha = 1;
  }
}

/** A dashboard-like phone UI: balance card, chart line, list rows. */
function drawPhone(g: CanvasRenderingContext2D, w: number, h: number) {
  g.fillStyle = "#0b1020";
  g.fillRect(0, 0, w, h);
  const grd = g.createLinearGradient(0, 0, w, 0);
  grd.addColorStop(0, "#F7D488");
  grd.addColorStop(1, "#B9822A");
  g.fillStyle = grd;
  g.beginPath();
  g.roundRect(20, 50, w - 40, 120, 16);
  g.fill();
  g.fillStyle = "#0A0E16";
  g.fillRect(40, 80, 90, 12);
  g.fillRect(40, 110, 150, 22);
  g.strokeStyle = "#3D6BFF";
  g.lineWidth = 5;
  g.beginPath();
  [0, 0.35, 0.25, 0.6, 0.5, 0.8, 0.7, 0.95].forEach((v, i, a) => g.lineTo(28 + (i / (a.length - 1)) * (w - 56), 330 - v * 110));
  g.stroke();
  for (let i = 0; i < 4; i++) {
    const y = 380 + i * 64;
    g.fillStyle = "#151c30";
    g.beginPath();
    g.roundRect(20, y, w - 40, 50, 10);
    g.fill();
    g.fillStyle = i % 2 ? "#7f9cff" : "#E3A93B";
    g.beginPath();
    g.arc(46, y + 25, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#8E9AB2";
    g.fillRect(70, y + 18, 90, 8);
    g.fillStyle = "#F4EBD9";
    g.fillRect(w - 100, y + 18, 60, 10);
  }
}

function drawPanel(g: CanvasRenderingContext2D, w: number, h: number) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = "rgba(17,23,38,0.82)";
  g.beginPath();
  g.roundRect(4, 4, w - 8, h - 8, 18);
  g.fill();
  g.strokeStyle = "rgba(227,169,59,0.9)";
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = "#E3A93B";
  g.fillRect(24, 26, 70, 10);
  for (let i = 0; i < 5; i++) {
    const bh = 20 + ((i * 37) % 60);
    g.fillStyle = i === 3 ? "#3D6BFF" : "rgba(244,235,217,0.75)";
    g.fillRect(28 + i * 34, h - 24 - bh, 20, bh);
  }
}

/** Sleek dark laptop and phone with floating gold UI panels and code windows. */
export function Devices({ quality = "high" }: { quality?: Quality }) {
  const group = useRef<THREE.Group>(null);
  const code = useCanvasTexture(1024, 640, drawCode);
  const phone = useCanvasTexture(320, 640, drawPhone);
  const panel = useCanvasTexture(256, 160, drawPanel);
  useFrame((state, dt) => {
    if (group.current) group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.35 + Math.sin(state.clock.elapsedTime * 0.3) * 0.18, 2, dt);
  });
  return (
    <group ref={group} position={[0, -0.35, 0]} rotation={[0.18, -0.35, 0]} scale={0.95}>
      {/* Laptop base */}
      <RoundedBox args={[2.3, 0.07, 1.5]} radius={0.03} smoothness={3} position={[0, 0, 0]}>
        <SteelMaterial color="#161c2a" />
      </RoundedBox>
      <mesh position={[0, 0.037, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.95, 0.85]} />
        <meshStandardMaterial color="#0d121e" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.038, 0.58]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.3]} />
        <meshStandardMaterial color="#1c2436" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Lid hinged at the back edge */}
      <group position={[0, 0.035, -0.74]} rotation={[-0.28, 0, 0]}>
        <RoundedBox args={[2.3, 1.45, 0.05]} radius={0.03} smoothness={3} position={[0, 0.72, 0]}>
          <SteelMaterial color="#161c2a" />
        </RoundedBox>
        <mesh position={[0, 0.74, 0.027]}>
          <planeGeometry args={[2.12, 1.3]} />
          <meshBasicMaterial map={code} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.72, -0.027]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.1, 32]} />
          <GoldMaterial quality={quality} />
        </mesh>
      </group>
      {/* Phone */}
      <group position={[1.45, 0.48, 0.45]} rotation={[-0.1, -0.5, 0.05]}>
        <RoundedBox args={[0.55, 1.1, 0.05]} radius={0.06} smoothness={4}>
          <SteelMaterial color="#141a27" />
        </RoundedBox>
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[0.49, 1.0]} />
          <meshBasicMaterial map={phone} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.026]}>
          <boxGeometry args={[0.57, 1.12, 0.004]} />
          <GoldMaterial quality={quality} />
        </mesh>
      </group>
      {/* Floating gold UI panels */}
      {[
        [-1.45, 1.35, 0.2, 0.15],
        [0.55, 1.75, -0.2, -0.1],
        [-0.9, 0.55, 0.9, 0.25],
      ].map(([x, y, z, r], i) => (
        <Float key={i} speed={1.4 + i * 0.3} rotationIntensity={0.25} floatIntensity={0.6}>
          <mesh position={[x, y, z]} rotation={[0, r, 0]}>
            <planeGeometry args={[0.8, 0.5]} />
            <meshBasicMaterial map={panel} transparent toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </Float>
      ))}
      <pointLight position={[0, 1.2, 1.2]} color={BRAND.goldLight} intensity={1.2} distance={4} />
    </group>
  );
}
