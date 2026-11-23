"use client";
import { useEffect } from "react";

const KEY = "nv_attr";
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "li_fat_id"];

/**
 * Captures first-touch attribution for this browsing session (landing page, referrer, UTM and ad click IDs).
 * Kept in sessionStorage only and sent to the server solely when the visitor submits a form.
 */
export function AttributionTracker() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const existing = JSON.parse(sessionStorage.getItem(KEY) || "null") as Record<string, string> | null;
      const fromUrl: Record<string, string> = {};
      for (const p of PARAMS) {
        const v = url.searchParams.get(p);
        if (v) fromUrl[p] = v.slice(0, 300);
      }
      const hasCampaign = Object.keys(fromUrl).length > 0;
      if (!existing || hasCampaign) {
        const ref = document.referrer && new URL(document.referrer).host !== url.host ? document.referrer : existing?.referrer || "";
        sessionStorage.setItem(
          KEY,
          JSON.stringify({ ...(hasCampaign ? {} : existing || {}), ...fromUrl, landingPage: url.pathname + url.search, referrer: ref.slice(0, 500) }),
        );
      }
    } catch {
      /* storage unavailable */
    }
  }, []);
  return null;
}

export function readAttribution(): string {
  try {
    const a = JSON.parse(sessionStorage.getItem(KEY) || "{}");
    return JSON.stringify({ ...a, sourcePage: window.location.pathname });
  } catch {
    return JSON.stringify({ sourcePage: typeof window !== "undefined" ? window.location.pathname : "" });
  }
}
