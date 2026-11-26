import type { ModelKey } from "@/components/three/Scene";
import type { SiteSettings } from "./settings";

/** Which 3D scene illustrates a service (by its icon, so services added in the admin panel get one too). */
const BY_ICON: Record<string, Exclude<ModelKey, "hero" | "orbit">> = {
  code: "software",
  globe: "software",
  smartphone: "software",
  bot: "software",
  chart: "exchange",
  blocks: "blockchain",
  exchange: "blockchain",
  wallet: "blockchain",
  shield: "security",
  landmark: "exchange",
};

const ALT: Record<string, string> = {
  software: "3D illustration: a dark laptop and phone surrounded by floating gold interface panels",
  blockchain: "3D illustration: translucent glass blocks linked by gold chains",
  security: "3D illustration: a gold and steel shield engraved with circuit lines around a glowing blue core",
  exchange: "3D illustration: gold coin stacks in front of a blue candlestick-chart hologram",
};

export function serviceModel(icon: string, settings: SiteSettings) {
  const model = BY_ICON[icon] ?? "software";
  return { model, url: settings.models[model] || undefined, alt: ALT[model] };
}
