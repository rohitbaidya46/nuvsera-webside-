"use client";
import { View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { dprFor, listenPointer, setViewsReady, type Quality } from "./state";

/**
 * One WebGL context for every in-page 3D model (service cards, NS Exchange, tech orbit, …). Each <ModelView>
 * renders into its own scissored region of this fixed, transparent, click-through canvas.
 */
export default function ViewCanvas({ quality }: { quality: Quality }) {
  useEffect(() => {
    listenPointer();
    return () => setViewsReady(false);
  }, []);
  return (
    <Canvas
      aria-hidden
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }}
      dpr={dprFor(quality)}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => setViewsReady(true)}
    >
      <View.Port />
    </Canvas>
  );
}
