import {
  BarChart3, Blocks, Bot, CandlestickChart, Code2, Globe, ShieldCheck, Smartphone, type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  code: Code2,
  globe: Globe,
  smartphone: Smartphone,
  blocks: Blocks,
  exchange: CandlestickChart,
  bot: Bot,
  shield: ShieldCheck,
  chart: BarChart3,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = SERVICE_ICONS[name] ?? Code2;
  return <Icon className={className} aria-hidden="true" />;
}
