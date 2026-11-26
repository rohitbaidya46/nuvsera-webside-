"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Glow, GoldMaterial } from "../materials";
import { BRAND, type Quality } from "../runtime";

/** Heraldic shield outline (scale s). */
function outline<T extends THREE.Path>(s: number, path: T): T {
  path.moveTo(0, 1.3 * s);
  path.bezierCurveTo(0.35 * s, 1.08 * s, 0.75 * s, 1.08 * s, 1.1 * s, 1.18 * s);
  path.lineTo(1.1 * s, 0.25 * s);
  path.bezierCurveTo(1.08 * s, -0.55 * s, 0.6 * s, -1.05 * s, 0, -1.42 * s);
  path.bezierCurveTo(-0.6 * s, -1.05 * s, -1.08 * s, -0.55 * s, -1.1 * s, 0.25 * s);
  path.lineTo(-1.1 * s, 1.18 * s);
  path.bezierCurveTo(-0.75 * s, 1.08 * s, -0.35 * s, 1.08 * s, 0, 1.3 * s);
  return path;
}

/** Height of the domed shield face at (x, y): highest in the centre, falling to the rim, with a central keel. */
const dome = (x: number, y: number) => {
  const r = Math.min(1, (x / 1.05) ** 2 + ((y + 0.05) / 1.35) ** 2);
  return 0.22 * (1 - r) + 0.035 * Math.max(0, 1 - Math.abs(x) / 0.06) * (1 - r);
};

// Circuit traces (right half; mirrored), routed at right angles like PCB tracks.
const TRACES: [number, number][][] = [
  [[0.34, 0.12], [0.55, 0.12], [0.55, 0.48], [0.8, 0.48]],
  [[0.32, -0.1], [0.62, -0.1], [0.62, -0.36], [0.44, -0.56]],
  [[0.12, 0.36], [0.12, 0.74], [0.42, 0.74]],
  [[0.16, -0.32], [0.16, -0.86]],
  [[0.3, 0.3], [0.36, 0.3], [0.36, 0.94], [0.72, 0.94]],
];

/** Futuristic gold and dark-steel shield: domed body, bevelled gold rim, raised circuit traces, glass-covered blue core. */
export function Shield({ quality = "high" }: { quality?: Quality }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  const { body, rim, back } = useMemo(() => {
    // Body: flat extrusion with many segments, then the front face is pushed out into a dome.
    const b = new THREE.ExtrudeGeometry(outline(0.9, new THREE.Shape()), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 40 });
    b.translate(0, 0, -0.06);
    // Domed face: triangulate the outline, subdivide it finely, then lift every vertex onto the dome.
    const tess = subdivideFlat(new THREE.ShapeGeometry(outline(0.9, new THREE.Shape()), 16), 4);
    const p = tess.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setZ(i, 0.09 + dome(p.getX(i), p.getY(i)));
    tess.computeVertexNormals();
    const rimShape = outline(1, new THREE.Shape());
    rimShape.holes.push(outline(0.88, new THREE.Path()));
    const r = new THREE.ExtrudeGeometry(rimShape, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 5, curveSegments: 48 });
    r.translate(0, 0, -0.13);
    return { body: tess, rim: r, back: b };
  }, []);

  const traces = useMemo(() => {
    const all = TRACES.flatMap((t) => [t, t.map(([x, y]) => [-x, y] as [number, number])]);
    return all.map((pts) => {
      const v = pts.map(([x, y]) => new THREE.Vector3(x, y, 0.1 + dome(x, y) + 0.012));
      const path = new THREE.CurvePath<THREE.Vector3>();
      for (let i = 0; i < v.length - 1; i++) path.add(new THREE.LineCurve3(v[i], v[i + 1]));
      return { tube: new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, 48, 0.011, 6, false), end: v[v.length - 1], start: v[0] };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) (core.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(t * 2.2) * 0.6;
    if (ring.current) ring.current.rotation.z = t * 0.6;
    if (group.current) group.current.position.y = Math.sin(t * 0.9) * 0.03;
  });

  const cz = 0.1 + dome(0, 0.08);
  return (
    <group ref={group} rotation={[0.12, -0.32, 0]} scale={0.98}>
      {/* Dark steel back plate and domed face */}
      <mesh geometry={back}>
        <meshStandardMaterial color="#161d2b" metalness={0.85} roughness={0.4} />
      </mesh>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#1c2536" metalness={0.9} roughness={0.28} clearcoat={0.6} clearcoatRoughness={0.25} envMapIntensity={1.3} />
      </mesh>
      {/* Bevelled gold rim */}
      <mesh geometry={rim}>
        <GoldMaterial quality={quality} roughness={0.22} />
      </mesh>
      {/* Raised gold circuit traces with solder pads */}
      {traces.map((tr, i) => (
        <group key={i}>
          <mesh geometry={tr.tube}>
            <GoldMaterial quality={quality} roughness={0.3} />
          </mesh>
          <mesh position={tr.end} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.025, 20]} />
            <GoldMaterial quality={quality} />
          </mesh>
          <mesh position={tr.end}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial color={BRAND.blue} emissive={BRAND.blue} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Core: gold bezel, rotating segmented ring, glowing sphere under a glass dome */}
      <group position={[0, 0.08, cz]}>
        <mesh>
          <torusGeometry args={[0.36, 0.045, 24, 96]} />
          <GoldMaterial quality={quality} roughness={0.18} />
        </mesh>
        <mesh ref={ring} position={[0, 0, 0.02]}>
          <ringGeometry args={[0.25, 0.29, 48, 1, 0, Math.PI * 1.55]} />
          <meshStandardMaterial color={BRAND.blue} emissive={BRAND.blue} emissiveIntensity={1.8} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={core} position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.17, 48, 48]} />
          <meshStandardMaterial color="#6f8fff" emissive={BRAND.blue} emissiveIntensity={2.2} roughness={0.2} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.03]} scale={[1, 1, 0.55]}>
          <sphereGeometry args={[0.31, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#cfe0ff" transparent opacity={0.18} roughness={0.02} metalness={0} clearcoat={1} envMapIntensity={2.5} depthWrite={false} />
        </mesh>
        <group position={[0, 0, 0.06]}>
          <Glow color="#3d6bff" scale={0.95} opacity={0.7} />
        </group>
      </group>
      <pointLight position={[0, 0.1, 0.8]} color={BRAND.blue} intensity={3} distance={3} />
    </group>
  );
}

/** Midpoint-subdivides a flat indexed triangle mesh `levels` times (keeps it planar; displacement happens after). */
function subdivideFlat(geo: THREE.BufferGeometry, levels: number) {
  let positions: number[] = Array.from((geo.attributes.position as THREE.BufferAttribute).array as Float32Array);
  let indices: number[] = Array.from(geo.index!.array as ArrayLike<number>);
  for (let l = 0; l < levels; l++) {
    const cache = new Map<string, number>();
    const mid = (a: number, b: number) => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      let m = cache.get(key);
      if (m === undefined) {
        m = positions.length / 3;
        positions.push((positions[a * 3] + positions[b * 3]) / 2, (positions[a * 3 + 1] + positions[b * 3 + 1]) / 2, 0);
        cache.set(key, m);
      }
      return m;
    };
    const next: number[] = [];
    for (let i = 0; i < indices.length; i += 3) {
      const [a, b, c] = [indices[i], indices[i + 1], indices[i + 2]];
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      next.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
    }
    indices = next;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  out.setIndex(indices);
  return out;
}
