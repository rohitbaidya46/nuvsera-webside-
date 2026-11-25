"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { readAttribution } from "@/components/site/AttributionTracker";

function send(body: Record<string, unknown>) {
  fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), keepalive: true }).catch(() => {});
}

/**
 * Cookieless first-party analytics: one anonymous page-view per navigation, and a record of every WhatsApp,
 * call and email button click (so those enquiries appear in Admin → Leads). No cookies, no third parties.
 */
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    send({ type: "view", path: pathname });
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const channel = /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href) ? "whatsapp" : href.startsWith("tel:") ? "phone" : href.startsWith("mailto:") ? "email" : null;
      if (channel) send({ type: "click", channel, path: location.pathname, attribution: readAttribution() });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
