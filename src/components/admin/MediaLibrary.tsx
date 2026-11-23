"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { api } from "./api";

type Item = { id: string; url: string; alt: string; filename: string; width: number | null; height: number | null; size: number };

export function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/media", { form: new FormData(f) });
      f.reset();
      setMsg("Uploaded and converted to WebP.");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={upload} className="mb-6 grid gap-3 rounded-xl border border-line bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label><span className="field-label">Image (JPG, PNG, WebP, GIF — max 8 MB)</span><input name="file" type="file" required accept="image/png,image/jpeg,image/webp,image/gif" className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-3 file:py-2 file:font-semibold file:text-fg" /></label>
        <label><span className="field-label">Alt text (describe the image)</span><input name="alt" maxLength={250} className="field" placeholder="e.g. Team reviewing a dashboard on a laptop" /></label>
        <button className="btn-navy" disabled={busy}><Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload"}</button>
        {msg && <p role="status" className="text-sm text-muted sm:col-span-3">{msg}</p>}
      </form>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <li key={m.id} className="overflow-hidden rounded-xl border border-line bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt} className="aspect-video w-full bg-surface object-cover" loading="lazy" />
            <div className="space-y-2 p-3">
              <p className="truncate text-xs text-muted">{m.filename} · {m.width}×{m.height} · {Math.round(m.size / 1024)} KB</p>
              <label className="block"><span className="sr-only">Alt text for {m.filename}</span>
                <input defaultValue={m.alt} placeholder="Alt text" className="field py-1.5 text-sm" onBlur={(e) => e.target.value !== m.alt && api(`/api/admin/media/${m.id}`, { method: "PATCH", body: { alt: e.target.value } }).then(() => setMsg("Alt text saved.")).catch((er) => setMsg(er.message))} />
              </label>
              <div className="flex gap-2">
                <button type="button" className="btn-outline min-h-9 flex-1 py-1 text-xs" onClick={() => navigator.clipboard.writeText(m.url).then(() => setMsg("URL copied."))}><Copy className="h-3.5 w-3.5" /> Copy URL</button>
                <button type="button" aria-label={`Delete ${m.filename}`} className="btn min-h-9 px-2 py-1 text-red-700 hover:bg-red-50" onClick={() => confirm("Delete this image? Pages using it will show a broken image.") && api(`/api/admin/media/${m.id}`, { method: "DELETE" }).then(() => router.refresh())}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="col-span-full py-10 text-center text-muted">No images uploaded yet.</li>}
      </ul>
    </>
  );
}
