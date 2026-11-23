"use client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ExternalLink, Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import { getResource, type Field } from "@/lib/admin/resources";
import { ApiError, api } from "./api";
import { MediaPicker } from "./MediaPicker";
import { RichTextEditor } from "./RichTextEditor";

type Values = Record<string, unknown>;

const toLocalInput = (iso: unknown) => {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};

function FieldInput({ f, value, set, error, categories }: { f: Field; value: unknown; set: (v: unknown) => void; error?: string; categories: { id: string; name: string }[] }) {
  const id = useId();
  const [picker, setPicker] = useState(false);
  const label = (
    <label htmlFor={id} className="field-label">{f.label}{f.required && <span className="text-red-600"> *</span>}</label>
  );
  const help = f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>;
  const err = error && <p className="field-error" role="alert">{error}</p>;
  const str = (value as string) ?? "";
  const counter = f.max && (f.type === "text" || f.type === "textarea") ? <span className="float-right text-xs text-muted">{str.length}/{f.max}</span> : null;

  switch (f.type) {
    case "boolean":
      return (
        <div>
          <label className="flex items-start gap-2.5 text-sm font-medium text-fg"><input id={id} type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2a55e0]" />{f.label}</label>
          {help}{err}
        </div>
      );
    case "textarea":
      return <div>{counter}{label}<textarea id={id} value={str} onChange={(e) => set(e.target.value)} rows={4} maxLength={f.max} className="field" aria-invalid={!!error} />{help}{err}</div>;
    case "richtext":
      return <div><p className="field-label">{f.label}{f.required && <span className="text-red-600"> *</span>}</p><RichTextEditor id={id} label={f.label} value={str} onChange={set} />{help}{err}</div>;
    case "number":
      return <div>{label}<input id={id} type="number" value={str === null ? "" : String(value ?? "")} onChange={(e) => set(e.target.value)} className="field" aria-invalid={!!error} />{help}{err}</div>;
    case "select":
      return <div>{label}<select id={id} value={str} onChange={(e) => set(e.target.value)} className="field" aria-invalid={!!error}>{!f.required && <option value="">—</option>}{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{help}{err}</div>;
    case "category":
      return <div>{label}<select id={id} value={str} onChange={(e) => set(e.target.value)} className="field"><option value="">Uncategorised</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{help}{err}</div>;
    case "multiselect": {
      const arr = (value as string[]) ?? [];
      return (
        <fieldset><legend className="field-label">{f.label}</legend>
          <div className="grid gap-1.5 sm:grid-cols-2">{f.options?.map((o) => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-fg"><input type="checkbox" checked={arr.includes(o.value)} onChange={(e) => set(e.target.checked ? [...arr, o.value] : arr.filter((x) => x !== o.value))} className="h-4 w-4 accent-[#2a55e0]" />{o.label}</label>
          ))}</div>{help}{err}
        </fieldset>
      );
    }
    case "datetime":
      return <div>{label}<input id={id} type="datetime-local" value={toLocalInput(value)} onChange={(e) => set(e.target.value ? new Date(e.target.value).toISOString() : "")} className="field" aria-invalid={!!error} />{help}{err}</div>;
    case "list":
      return <div>{label}<textarea id={id} value={((value as string[]) ?? []).join("\n")} onChange={(e) => set(e.target.value.split("\n"))} rows={6} className="field" />{help}{err}</div>;
    case "tags":
      return <div>{label}<input id={id} value={((value as string[]) ?? []).join(", ")} onChange={(e) => set(e.target.value.split(",").map((t) => t.trimStart()))} className="field" />{help}{err}</div>;
    case "image":
      return (
        <div>{label}
          <div className="flex gap-2"><input id={id} value={str} onChange={(e) => set(e.target.value)} className="field" placeholder="/media/… or https://" aria-invalid={!!error} /><button type="button" className="btn-outline shrink-0" onClick={() => setPicker(true)}><ImageIcon className="h-4 w-4" /> Choose</button></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {str && <img src={str} alt="" className="mt-2 max-h-32 rounded-lg border border-line" />}
          {help}{err}
          {picker && <MediaPicker onClose={() => setPicker(false)} onSelect={(m) => { set(m.url); setPicker(false); }} />}
        </div>
      );
    case "steps":
    case "faqs": {
      const isSteps = f.type === "steps";
      const [a, b] = isSteps ? ["title", "description"] : ["question", "answer"];
      const arr = (value as Record<string, string>[]) ?? [];
      const update = (i: number, k: string, v: string) => set(arr.map((x, n) => (n === i ? { ...x, [k]: v } : x)));
      return (
        <fieldset><legend className="field-label">{f.label}</legend>
          <ol className="space-y-3">{arr.map((x, i) => (
            <li key={i} className="rounded-lg border border-line p-3">
              <div className="flex gap-2">
                <input aria-label={`${isSteps ? "Step" : "Question"} ${i + 1}`} value={x[a] ?? ""} onChange={(e) => update(i, a, e.target.value)} placeholder={isSteps ? "Step title" : "Question"} className="field" />
                <button type="button" onClick={() => set(arr.filter((_, n) => n !== i))} className="rounded p-2 text-muted hover:text-red-600" aria-label={`Remove item ${i + 1}`}><X className="h-4 w-4" /></button>
              </div>
              <textarea aria-label={`${isSteps ? "Description" : "Answer"} ${i + 1}`} value={x[b] ?? ""} onChange={(e) => update(i, b, e.target.value)} rows={2} placeholder={isSteps ? "Description" : "Answer"} className="field mt-2" />
            </li>
          ))}</ol>
          <button type="button" className="btn-outline mt-3" onClick={() => set([...arr, { [a]: "", [b]: "" }])}><Plus className="h-4 w-4" /> Add {isSteps ? "step" : "FAQ"}</button>
          {err}
        </fieldset>
      );
    }
    default:
      return <div>{counter}{label}<input id={id} type={f.type === "url" ? "url" : "text"} value={str} onChange={(e) => set(f.type === "slug" ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") : e.target.value)} maxLength={f.max} className="field" aria-invalid={!!error} />{help}{err}</div>;
  }
}

export function ResourceForm({ resourceKey, initial, categories = [], canDelete }: { resourceKey: string; initial: Values; categories?: { id: string; name: string }[]; canDelete: boolean }) {
  const r = getResource(resourceKey)!;
  const router = useRouter();
  const isNew = !initial.id;
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (v: unknown) => {
    setValues((p) => {
      const next = { ...p, [k]: v };
      if (isNew && k === r.titleField && r.fields.some((f) => f.name === "slug") && !p.__slugTouched) {
        next.slug = String(v).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
      }
      if (k === "slug") next.__slugTouched = true;
      return next;
    });
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErrors({});
    const payload: Values = {};
    for (const f of r.fields) payload[f.name] = values[f.name];
    try {
      const res = await api<{ id: string }>(isNew ? `/api/admin/content/${r.key}` : `/api/admin/content/${r.key}/${initial.id}`, { method: isNew ? "POST" : "PATCH", body: payload });
      setMsg({ ok: true, text: "Saved." });
      if (isNew) router.replace(`/admin/content/${r.key}/${res.id}`);
      else router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Save failed" });
      if (err instanceof ApiError) setErrors(err.fields);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete this ${r.singular.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/content/${r.key}/${initial.id}`, { method: "DELETE" });
      router.replace(`/admin/content/${r.key}`);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Delete failed" });
    }
  }

  const group = (g: Field["group"]) => r.fields.filter((f) => (f.group ?? "main") === g);
  const render = (f: Field) => <FieldInput key={f.name} f={f} value={values[f.name]} set={set(f.name)} error={errors[f.name]} categories={categories} />;
  const path = !isNew && r.publicPath ? r.publicPath(values) : null;

  return (
    <form onSubmit={save} noValidate className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-5 rounded-xl border border-line bg-card p-5 lg:col-span-2">{group("main").map(render)}</div>
      <div className="space-y-4">
        <div className="sticky top-4 space-y-4">
          <div className="space-y-3 rounded-xl border border-line bg-card p-5">
            {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-600"}`}>{msg.text}</p>}
            <button className="btn-navy w-full" disabled={busy}>{busy ? "Saving…" : isNew ? `Create ${r.singular.toLowerCase()}` : "Save changes"}</button>
            {path && <a href={path} target="_blank" className="btn-outline w-full"><ExternalLink className="h-4 w-4" /> View on site</a>}
            {!isNew && canDelete && r.canDelete !== false && <button type="button" onClick={remove} className="btn w-full text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /> Delete</button>}
          </div>
          {group("side").length > 0 && <div className="space-y-4 rounded-xl border border-line bg-card p-5">{group("side").map(render)}</div>}
          {group("seo").length > 0 && (
            <details className="rounded-xl border border-line bg-card p-5" open={Object.keys(errors).some((k) => group("seo").some((f) => f.name === k))}>
              <summary className="cursor-pointer font-semibold text-fg">SEO settings</summary>
              <div className="mt-4 space-y-4">{group("seo").map(render)}</div>
            </details>
          )}
        </div>
      </div>
    </form>
  );
}
