"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./api";

export function RunBackup() {
  const router = useRouter();
  const [state, setState] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      {state && <span role="status" className="text-sm text-muted">{state}</span>}
      <button className="btn-navy" onClick={() => { setState("Running…"); api("/api/admin/backups", { method: "POST" }).then(() => { setState("Backup complete."); router.refresh(); }).catch((e) => setState(e.message)); }}>Run backup now</button>
    </div>
  );
}
