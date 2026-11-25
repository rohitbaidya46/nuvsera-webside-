"use client";
import { View } from "@react-three/drei";
import { Suspense } from "react";
import { Model, SceneRig, type ModelKey } from "./Scene";
import type { OrbitIcon } from "./models/TechOrbit";
import type { Quality } from "./state";

export default function ModelViewInner(props: { model: ModelKey; quality: Quality; url?: string; scrollKey?: string; icons?: OrbitIcon[]; z?: number }) {
  return (
    <View className="absolute inset-0">
      <SceneRig z={props.z} />
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </View>
  );
}
