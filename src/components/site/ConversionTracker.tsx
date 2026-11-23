"use client";
import { useEffect } from "react";
import { trackLeadConversion } from "./ConsentManager";

/** Fires conversion events once per successful submission (not on refresh or direct visits). */
export function ConversionTracker({ kind }: { kind: string }) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("nv_conv_pending") !== "1") return;
      sessionStorage.removeItem("nv_conv_pending");
    } catch {
      return;
    }
    // Allow consent manager to initialise tracking first.
    const t = setTimeout(() => trackLeadConversion(kind), 400);
    return () => clearTimeout(t);
  }, [kind]);
  return null;
}
