"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { api } from "./api";

export type MediaItem = { id: string; url: string; alt: string; filename: string; width: number | null; height: number | null };

export function MediaPicker({ onSelect, onClose }: { onSelect: (m: MediaItem) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const load = () => api<{ items: MediaItem[] }>("/api/admin/media").then((r) => setItems(r.items)).catch((e) => setErr(e.message));
  useEffect(() => {
    load();
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const alt = window.prompt("Describe the image for screen readers (alt text):", "") ?? "";
    const fd = new FormData();
    fd.set("file", files[0]);
    fd.set("alt", alt);
    setBusy(true);
    setErr(null);
    try {
      const r = await api<{ item: MediaItem }>("/api/admin/media", { form: fd });
      onSelect(r.item);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Media library">
      <div ref={ref} tabIndex={-1} className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-card shadow-2xl outline-none">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-semibold text-fg">Choose an image</h2>
          <div className="flex items-center gap-2">
            <label className="btn-outline cursor-pointer"><Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => upload(e.target.files)} /></label>
            <button type="button" onClick={onClose} className="rounded p-2 text-muted hover:text-fg" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
        </div>
        {err && <p role="alert" className="px-4 pt-3 text-sm text-red-600">{err}</p>}
        <ul className="grid grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-4">
          {items.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => onSelect(m)} className="block w-full overflow-hidden rounded-lg border border-line text-left hover:ring-2 hover:ring-brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt} className="aspect-square w-full object-cover" loading="lazy" />
                <span className="block truncate px-2 py-1 text-xs text-muted">{m.alt || m.filename}</span>
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="col-span-full py-8 text-center text-sm text-muted">No images yet — upload one.</li>}
        </ul>
      </div>
    </div>
  );
}
