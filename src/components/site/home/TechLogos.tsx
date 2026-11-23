import {
  siReact, siNextdotjs, siNodedotjs, siTypescript, siFlutter, siKotlin, siSwift, siSolidity, siEthereum, siPython, siPostgresql, siMongodb, siRedis, siDocker, siKubernetes, siGooglecloud, siTensorflow,
} from "simple-icons";

const si = { siReact, siNextdotjs, siNodedotjs, siTypescript, siFlutter, siKotlin, siSwift, siSolidity, siEthereum, siPython, siPostgresql, siMongodb, siRedis, siDocker, siKubernetes, siGooglecloud, siTensorflow };

const STACK: { name: string; icon?: keyof typeof si }[] = [
  { name: "React", icon: "siReact" },
  { name: "Next.js", icon: "siNextdotjs" },
  { name: "Node.js", icon: "siNodedotjs" },
  { name: "TypeScript", icon: "siTypescript" },
  { name: "Flutter", icon: "siFlutter" },
  { name: "Kotlin", icon: "siKotlin" },
  { name: "Swift", icon: "siSwift" },
  { name: "Solidity", icon: "siSolidity" },
  { name: "Ethereum", icon: "siEthereum" },
  { name: "Python", icon: "siPython" },
  { name: "PostgreSQL", icon: "siPostgresql" },
  { name: "MongoDB", icon: "siMongodb" },
  { name: "Redis", icon: "siRedis" },
  { name: "Docker", icon: "siDocker" },
  { name: "Kubernetes", icon: "siKubernetes" },
  { name: "AWS" },
  { name: "Google Cloud", icon: "siGooglecloud" },
  { name: "TensorFlow", icon: "siTensorflow" },
];

export function TechLogos({ items }: { items?: string[] }) {
  const list = items ? STACK.filter((s) => items.includes(s.name)) : STACK;
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {list.map((t, n) => {
        const icon = t.icon ? si[t.icon] : null;
        return (
          <li key={t.name} data-reveal style={{ ["--reveal-delay" as string]: `${(n % 6) * 40}ms` }} className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-line bg-card px-3 py-5 transition hover:border-brand/40 hover:shadow-sm">
            {icon ? (
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-fg/80" fill="currentColor" aria-hidden="true"><path d={icon.path} /></svg>
            ) : (
              <span className="flex h-8 items-center text-lg font-extrabold tracking-tight text-fg/80" aria-hidden>{t.name}</span>
            )}
            <span className="text-xs font-medium text-muted">{t.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
