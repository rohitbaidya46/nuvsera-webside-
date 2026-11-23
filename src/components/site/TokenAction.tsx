"use client";
import { useState } from "react";

export function TokenAction({ endpoint, token, label, done }: { endpoint: string; token: string; label: string; done: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  async function go() {
    setState("busy");
    const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }
  if (state === "done") return <p role="status" className="text-lg font-medium text-fg">{done}</p>;
  return (
    <div>
      <button type="button" onClick={go} disabled={state === "busy" || !token} className="btn-navy">{state === "busy" ? "Please wait…" : label}</button>
      {state === "error" && <p role="alert" className="field-error mt-3">This link is invalid or has expired.</p>}
    </div>
  );
}
