"use client";
/**
 * The Nuvsera brand film (≈26 s), rendered from the website's own 3D scenes.
 * Everything is driven by one clock (performance.now since start), so scripts/render-film.mjs can step it
 * frame by frame with a fake clock and capture perfectly smooth video on any machine.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Particles } from "@/components/three/HeroCanvas";
import { Model, SceneRig, type ModelKey } from "@/components/three/Scene";
import { BRAND, introSeg, scroll, startIntro } from "@/components/three/runtime";

type Shot = { key: ModelKey | "end"; from: number; to: number; cam: [[number, number, number], [number, number, number]]; kicker?: string; title?: string; sub?: string };

export const SHOTS: Shot[] = [
  { key: "hero", from: 0, to: 6.8, cam: [[-1.4, -0.5, 3.2], [0, 0, 6.6]] },
  { key: "blockchain", from: 6.8, to: 10.4, cam: [[1.6, 0.6, 5.2], [-0.3, 0.1, 6.4]], kicker: "Blockchain", title: "Exchanges, ledgers and the chains that bind them", sub: "Spot & P2P exchanges · custody-aware wallets · smart contracts" },
  { key: "security", from: 10.4, to: 14.0, cam: [[-0.6, -0.3, 4.4], [0.4, 0.1, 5.8]], kicker: "Cybersecurity", title: "Secured before it ships", sub: "VAPT · secure architecture · compliance-ready audits" },
  { key: "software", from: 14.0, to: 17.6, cam: [[-1.8, 1.2, 5.6], [0.2, 0.4, 6.6]], kicker: "Custom software", title: "Software shaped around your business", sub: "Web platforms · iOS & Android apps · fintech back offices" },
  { key: "exchange", from: 17.6, to: 21.4, cam: [[1.2, 0.9, 4.8], [-0.2, 0.3, 6.4]], kicker: "NS Exchange", title: "Built and owned by Nuvsera", sub: "nsexchange.com" },
  { key: "end", from: 21.4, to: 26.5, cam: [[0, 0.1, 6.2], [0, 0.15, 7.4]] },
];
export const FILM_DURATION = 26.5;

let t0 = -1;
const filmTime = () => (t0 < 0 ? 0 : (performance.now() - t0) / 1000);

function ease(x: number) {
  const k = Math.min(1, Math.max(0, x));
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
}

/** Moves the camera along each shot's path, sweeps a light across the gold, and fades exposure. */
function Director({ vertical }: { vertical: boolean }) {
  const { camera, gl } = useThree();
  const sweep = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const t = filmTime();
    const shot = SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
    const k = ease((t - shot.from) / (shot.to - shot.from));
    const [a, b] = shot.cam;
    const zf = vertical ? 1.75 : 1; // narrower frame: pull back
    camera.position.set(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, (a[2] + (b[2] - a[2]) * k) * zf);
    camera.lookAt(0, shot.key === "end" ? 0.55 : 0, 0);
    gl.toneMappingExposure = shot.key === "hero" ? 0.05 + 0.95 * introSeg(t, 0, 1.6) : 1;
    if (sweep.current) {
      const local = t - shot.from;
      const s = Math.min(1, Math.max(0, (local - 0.2) / 2.4));
      sweep.current.position.set(-3 + s * 6, 1.4 - s * 1.8, 1.8);
      sweep.current.intensity = Math.sin(s * Math.PI) * (shot.key === "hero" ? 60 : 38);
    }
    if (shot.key === "exchange") scroll.exchange = k;
  });
  return <pointLight ref={sweep} intensity={0} distance={7} decay={1.6} color="#fff4dc" />;
}

function ShotModels() {
  const [active, setActive] = useState<ModelKey | "end">("hero");
  useFrame(() => {
    const t = filmTime();
    const key = (SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1]).key;
    if (key !== active) setActive(key);
  });
  const show = (k: ModelKey | "end", node: ReactNode) => <group visible={active === k}>{node}</group>;
  return (
    <>
      {show("hero", <Model model="hero" quality="high" interactive />)}
      {show("blockchain", <Model model="blockchain" quality="high" />)}
      {show("security", <Model model="security" quality="high" />)}
      {show("software", <Model model="software" quality="high" />)}
      {show("exchange", <Model model="exchange" quality="high" scrollKey="exchange" />)}
      {show("end", <group position={[0, 0.85, 0]} scale={0.55}><Model model="hero" quality="high" /></group>)}
    </>
  );
}

/** DOM titles over the canvas, driven by the same clock. */
function Overlay({ vertical }: { vertical: boolean }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setT(filmTime());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const shot = SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const local = t - shot.from;
  const len = shot.to - shot.from;
  // Fade through black between shots.
  const black = Math.max(0, 1 - Math.min(local, len - local, 99) / 0.35) * (shot.from === 0 ? 0 : 1);
  const tail = Math.max(0, (t - (FILM_DURATION - 0.8)) / 0.8);
  const rise = (delay: number) => {
    const p = ease((local - delay) / 0.9);
    const out = shot.key === "end" ? 1 : 1 - ease((local - (len - 0.6)) / 0.4);
    return { opacity: p * out, transform: `translateY(${(1 - p) * 40}px)` };
  };
  const pad = vertical ? "px-16 pb-40" : "px-28 pb-24";
  return (
    <div className="pointer-events-none absolute inset-0 font-sans text-ivory">
      {shot.key === "hero" && (
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${vertical ? "pb-56" : "pb-20"}`}>
          <p style={rise(4.3)} className={`font-display font-semibold tracking-[0.5em] ${vertical ? "text-5xl" : "text-4xl"}`}>NUVSERA</p>
          <p style={rise(4.7)} className="mt-4 text-sm tracking-[0.42em] text-gold">TECHNOLOGY PRIVATE LIMITED</p>
        </div>
      )}
      {shot.title && (
        <div className={`absolute inset-x-0 bottom-0 ${pad} ${vertical ? "text-center" : ""}`}>
          <p style={rise(0.3)} className={`inline-flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.4em] text-gold ${vertical ? "justify-center" : ""}`}>
            <span className="h-px w-10 bg-gold" /> {shot.kicker}
          </p>
          <h2 style={rise(0.5)} className={`mt-5 font-serif font-medium leading-[1.02] ${vertical ? "text-7xl" : "max-w-5xl text-[5.5rem]"}`}>{shot.title}</h2>
          <p style={rise(0.8)} className={`mt-6 tracking-wide text-muted ${vertical ? "text-2xl" : "text-2xl"}`}>{shot.sub}</p>
        </div>
      )}
      {shot.key === "end" && (
        <div className={`absolute inset-x-0 bottom-0 flex flex-col items-center text-center ${vertical ? "pb-64" : "pb-24"}`}>
          <h2 style={rise(0.4)} className={`font-serif font-medium leading-[1.02] ${vertical ? "text-7xl" : "text-8xl"}`}>
            Technology for <em className="text-gold-gradient">secure digital finance</em>
          </h2>
          <p style={rise(1.0)} className="mt-8 text-sm uppercase tracking-[0.42em] text-muted">Custom Software · Blockchain · Cybersecurity</p>
          <p style={rise(1.6)} className={`mt-10 font-serif text-gold-gradient ${vertical ? "text-6xl" : "text-5xl"}`}>+91 97343 33355</p>
          <p style={rise(1.9)} className="mt-3 text-lg tracking-[0.3em] text-ivory/80">NUVSERATECHNOLOGY.COM · KOLKATA</p>
        </div>
      )}
      <div className="absolute inset-0 bg-navy" style={{ opacity: Math.max(black, tail) }} />
    </div>
  );
}

export default function FilmCanvas({ vertical = false }: { vertical?: boolean }) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const w = window as unknown as { __filmStart: () => void; __filmDuration: number; __filmReady?: boolean };
    w.__filmDuration = FILM_DURATION;
    w.__filmStart = () => {
      t0 = performance.now();
      startIntro();
      setStarted(true);
    };
    // Preview in a normal browser: start automatically.
    if (!new URLSearchParams(location.search).has("render")) w.__filmStart();
  }, []);
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-navy">
      <Canvas
        dpr={1}
        gl={{ antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        onCreated={() => ((window as unknown as { __filmReady: boolean }).__filmReady = true)}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={[BRAND.bg]} />
        <fog attach="fog" args={[BRAND.bg, 7, 18]} />
        <SceneRig fov={30} z={7} />
        <Director vertical={vertical} />
        <Particles count={1600} />
        <group scale={vertical ? 1 : 1}>
          <ShotModels />
        </group>
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.7} radius={0.7} />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>
      </Canvas>
      {started && <Overlay vertical={vertical} />}
      <div className="noise pointer-events-none absolute inset-0" />
    </div>
  );
}
