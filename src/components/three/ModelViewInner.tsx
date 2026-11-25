"use client";
import { View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { ModelControl } from "./control";
import { Model, SceneRig, type ModelKey } from "./Scene";
import type { OrbitIcon } from "./models/TechOrbit";
import type { Quality } from "./state";

/** Applies hover tilt (toward the cursor), drag rotation and release inertia from the DOM wrapper. */
function Interactive({ control, children }: { control: ModelControl; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const c = control;
    if (!g.current) return;
    if (!c.dragging) {
      c.ry += c.vy * dt * 60;
      c.vy *= Math.pow(0.93, dt * 60);
      c.rx = THREE.MathUtils.damp(c.rx, 0, 2.5, dt); // tilt eases back upright
    }
    const ty = c.ry + (c.hover && !c.dragging ? c.hx * 0.45 : 0);
    const tx = c.rx + (c.hover && !c.dragging ? -c.hy * 0.3 : 0);
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, ty, c.dragging ? 20 : 6, dt);
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, tx, c.dragging ? 20 : 6, dt);
    const s = c.hover ? 1.06 : 1;
    g.current.scale.setScalar(THREE.MathUtils.damp(g.current.scale.x, s, 6, dt));
  });
  return <group ref={g}>{children}</group>;
}

export default function ModelViewInner(props: { model: ModelKey; quality: Quality; url?: string; scrollKey?: string; icons?: OrbitIcon[]; z?: number; control: ModelControl }) {
  const { control, ...rest } = props;
  return (
    <View className="absolute inset-0">
      <SceneRig z={props.z} />
      <Suspense fallback={null}>
        <Interactive control={control}>
          <Model {...rest} />
        </Interactive>
      </Suspense>
    </View>
  );
}
