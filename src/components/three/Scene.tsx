"use client";
import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Blockchain } from "./models/Blockchain";
import { Crest } from "./models/Crest";
import { Devices } from "./models/Devices";
import { Exchange } from "./models/Exchange";
import { Shield } from "./models/Shield";
import { TechOrbit, type OrbitIcon } from "./models/TechOrbit";
import { BRAND, idleSeconds, pointer, scroll, studioEnvironment, type Quality } from "./runtime";

export type ModelKey = "hero" | "software" | "blockchain" | "security" | "exchange" | "orbit";

/** Studio lighting + procedural HDR environment for real metal reflections. Must be inside a scene (or View). */
export function SceneRig({ fov = 32, z = 6.2 }: { fov?: number; z?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.environment = studioEnvironment(gl);
    scene.environmentIntensity = 0.9;
  }, [gl, scene]);
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, z]} fov={fov} near={0.1} far={50} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff3dc" />
      <directionalLight position={[-4, -1, -3]} intensity={0.8} color={BRAND.blue} />
    </>
  );
}

/** Loads an uploaded GLB (Draco/Meshopt supported, decoders self-hosted under /draco) and fits it to the frame. */
function GlbModel({ url, size = 3.2 }: { url: string; size?: number }) {
  const { scene } = useGLTF(url, "/draco/", true);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const dim = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = size / Math.max(dim.x, dim.y, dim.z || 1);
    clone.position.sub(center.multiplyScalar(s));
    clone.scale.setScalar(s);
    return clone;
  }, [scene, size]);
  return <primitive object={obj} />;
}

/** Mouse tilt, idle spin and scroll response for uploaded models (the built-in crest has its own). */
function TiltGroup({ children, scrollKey }: { children: ReactNode; scrollKey?: string }) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef(0);
  useFrame((_, dt) => {
    if (!g.current) return;
    const idle = idleSeconds() > 1.6;
    if (idle) spin.current += dt * 0.35;
    const p = scrollKey ? scroll[scrollKey] ?? 0 : 0;
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, (idle ? 0 : -pointer.y * 0.35) + p * 0.8, 4, dt);
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, spin.current + (idle ? 0 : pointer.x * 0.5) + p, 4, dt);
  });
  return <group ref={g}>{children}</group>;
}

/** Falls back to the built-in model if an uploaded GLB fails to load. */
class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[3d] custom model failed to load, using the built-in model", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function Model({ model, quality, url, interactive, scrollKey, icons }: { model: ModelKey; quality: Quality; url?: string; interactive?: boolean; scrollKey?: string; icons?: OrbitIcon[] }) {
  const builtIn = (() => {
    switch (model) {
      case "hero":
        return <Crest quality={quality} interactive={interactive} scrollKey={scrollKey} />;
      case "software":
        return <Devices quality={quality} />;
      case "blockchain":
        return <Blockchain quality={quality} />;
      case "security":
        return <Shield quality={quality} />;
      case "exchange":
        return <Exchange quality={quality} scrollKey={scrollKey} />;
      case "orbit":
        return <TechOrbit quality={quality} icons={icons ?? []} />;
    }
  })();
  if (!url) return builtIn;
  return (
    <ModelBoundary fallback={builtIn}>
      <Suspense fallback={null}>
        {interactive ? (
          <TiltGroup scrollKey={scrollKey}>
            <GlbModel url={url} />
          </TiltGroup>
        ) : (
          <GlbModel url={url} />
        )}
      </Suspense>
    </ModelBoundary>
  );
}
