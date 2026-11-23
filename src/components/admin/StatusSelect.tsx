"use client";
import { useState } from "react";
import { api } from "./api";

export function StatusSelect({ endpoint, value, options, label, field = "status" }: { endpoint: string; value: string; options: string[]; label: string; field?: string }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={label}
        defaultValue={value}
        className="field py-1.5"
        onChange={(e) => {
          setState("saving");
          api(endpoint, { method: "PATCH", body: { [field]: e.target.value } }).then(() => setState("saved")).catch(() => setState("error"));
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
      </select>
      <span aria-live="polite" className="text-xs text-muted">{state === "saved" ? "✓" : state === "error" ? "Failed" : state === "saving" ? "…" : ""}</span>
    </div>
  );
}
