"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { ApiError, api } from "./api";
import { MediaPicker } from "./MediaPicker";
import { Panel } from "./ui";

type S = SiteSettings;

export function SettingsForm({ initial }: { initial: S }) {
  const router = useRouter();
  const [s, setS] = useState<S>(initial);
  const [smtpPassword, setSmtpPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [picker, setPicker] = useState(false);

  const upd = <K extends keyof S>(sec: K, key: string, v: unknown) => setS((p) => ({ ...p, [sec]: { ...(p[sec] as object), [key]: v } }));

  const input = <K extends "company" | "social" | "tracking" | "email" | "hero">(sec: K, key: string, label: string, opts: { help?: string; type?: string; placeholder?: string } = {}) => {
    const id = `${sec}-${key}`;
    const err = errors[`${sec}.${key}`];
    return (
      <div>
        <label htmlFor={id} className="field-label">{label}</label>
        <input id={id} type={opts.type ?? "text"} placeholder={opts.placeholder} className="field" aria-invalid={!!err} value={String((s[sec] as Record<string, unknown>)[key] ?? "")} onChange={(e) => upd(sec, key, opts.type === "number" ? Number(e.target.value) : e.target.value)} />
        {opts.help && !err && <p className="mt-1 text-xs text-muted">{opts.help}</p>}
        {err && <p className="field-error">{err}</p>}
      </div>
    );
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErrors({});
    const { smtpPassEnc: _omit, ...email } = s.email;
    try {
      await api("/api/admin/settings", { method: "PUT", body: { ...s, email, smtpPassword: smtpPassword || undefined } });
      setSmtpPassword("");
      setMsg({ ok: true, text: "Settings saved. Changes are live on the website." });
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Save failed" });
      if (err instanceof ApiError) setErrors(err.fields);
    } finally {
      setBusy(false);
    }
  }

  async function testEmail() {
    setMsg(null);
    try {
      const r = await api<{ message: string }>("/api/admin/settings/test-email", { method: "POST" });
      setMsg({ ok: true, text: r.message });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Test failed" });
    }
  }

  return (
    <form onSubmit={save} noValidate className="space-y-4">
      <Panel title="Company & legal (shown in footer)">
        <div className="grid gap-4 sm:grid-cols-2">
          {input("company", "legalName", "Legal name")}
          {input("company", "brandName", "Brand name")}
          {input("company", "cin", "CIN")}
          {input("company", "gstin", "GSTIN")}
          {input("company", "udyam", "Udyam registration no.")}
          {input("company", "udyamCategory", "Udyam category")}
          <div className="sm:col-span-2">{input("company", "tagline", "Tagline")}</div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="logo">Logo (optional — replaces the default wordmark)</label>
            <div className="flex gap-2"><input id="logo" className="field" value={s.company.logoUrl} onChange={(e) => upd("company", "logoUrl", e.target.value)} placeholder="/media/…" /><button type="button" className="btn-outline" onClick={() => setPicker(true)}>Choose</button></div>
          </div>
        </div>
      </Panel>

      <Panel title="Contact details">
        <div className="grid gap-4 sm:grid-cols-2">
          {input("company", "email", "Public email", { type: "email" })}
          {input("company", "phone", "Phone (display)")}
          {input("company", "whatsapp", "WhatsApp number", { help: "Digits only with country code, e.g. 917872994746" })}
          {input("company", "businessHours", "Business hours")}
          {input("company", "addressLine1", "Address line 1")}
          {input("company", "addressLine2", "Address line 2")}
          {input("company", "city", "City")}
          {input("company", "postalCode", "PIN code")}
          {input("company", "state", "State")}
          {input("company", "country", "Country")}
          <div className="sm:col-span-2">{input("company", "mapUrl", "Google Maps link")}</div>
        </div>
      </Panel>

      <Panel title="Social links">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["linkedin", "x", "facebook", "instagram", "youtube", "github"] as const).map((k) => <div key={k}>{input("social", k, k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1), { placeholder: "https://", type: "url" })}</div>)}
        </div>
      </Panel>

      <Panel title="Home page hero">
        <div className="space-y-4">
          {input("hero", "headline", "Main headline")}
          <div>
            <label className="field-label" htmlFor="hero-sub">Sub-headline</label>
            <textarea id="hero-sub" rows={3} className="field" value={s.hero.subheadline} onChange={(e) => upd("hero", "subheadline", e.target.value)} />
          </div>
          <div>
            <p className="field-label">Rotating headlines (shown after the main headline)</p>
            {s.hero.rotating.map((h, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input aria-label={`Rotating headline ${i + 1}`} className="field" value={h} onChange={(e) => upd("hero", "rotating", s.hero.rotating.map((x, n) => (n === i ? e.target.value : x)))} />
                <button type="button" className="rounded p-2 text-muted hover:text-red-600" aria-label="Remove" onClick={() => upd("hero", "rotating", s.hero.rotating.filter((_, n) => n !== i))}><X className="h-4 w-4" /></button>
              </div>
            ))}
            {s.hero.rotating.length < 5 && <button type="button" className="btn-outline" onClick={() => upd("hero", "rotating", [...s.hero.rotating, ""])}><Plus className="h-4 w-4" /> Add headline</button>}
          </div>
        </div>
      </Panel>

      <Panel title="Company statistics">
        <p className="mb-3 text-sm text-muted">The statistics section on the home page stays <strong>hidden until at least one figure is entered</strong>. Enter only real, verifiable numbers.</p>
        {s.stats.map((st, i) => (
          <div key={i} className="mb-2 grid grid-cols-[1fr_2fr_auto] gap-2">
            <input aria-label={`Stat ${i + 1} value`} placeholder="Value, e.g. 25+" className="field" value={st.value} onChange={(e) => setS((p) => ({ ...p, stats: p.stats.map((x, n) => (n === i ? { ...x, value: e.target.value } : x)) }))} />
            <input aria-label={`Stat ${i + 1} label`} placeholder="Label, e.g. Projects delivered" className="field" value={st.label} onChange={(e) => setS((p) => ({ ...p, stats: p.stats.map((x, n) => (n === i ? { ...x, label: e.target.value } : x)) }))} />
            <button type="button" aria-label="Remove statistic" className="rounded p-2 text-muted hover:text-red-600" onClick={() => setS((p) => ({ ...p, stats: p.stats.filter((_, n) => n !== i) }))}><X className="h-4 w-4" /></button>
          </div>
        ))}
        {s.stats.length < 6 && <button type="button" className="btn-outline" onClick={() => setS((p) => ({ ...p, stats: [...p.stats, { value: "", label: "" }] }))}><Plus className="h-4 w-4" /> Add statistic</button>}
      </Panel>

      <Panel title="Analytics & ad tracking">
        <p className="mb-3 text-sm text-muted">Tags load only for visitors who consent to analytics/marketing cookies.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("tracking", "ga4Id", "Google Analytics 4 measurement ID", { placeholder: "G-XXXXXXX" })}
          {input("tracking", "googleAdsId", "Google Ads ID", { placeholder: "AW-123456789" })}
          {input("tracking", "googleAdsLeadLabel", "Google Ads lead conversion label")}
          {input("tracking", "linkedinPartnerId", "LinkedIn Insight partner ID")}
          {input("tracking", "linkedinConversionId", "LinkedIn conversion ID")}
        </div>
      </Panel>

      <Panel title="Email delivery (SMTP)">
        <p className="mb-3 text-sm text-muted">Works with Amazon SES (SMTP), Brevo, Zoho Mail, Google Workspace and others. The password is encrypted at rest and never shown again.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="recips">Lead notification recipients (comma-separated)</label>
            <input id="recips" className="field" value={s.email.adminRecipients.join(", ")} onChange={(e) => upd("email", "adminRecipients", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} />
            {Object.keys(errors).some((k) => k.startsWith("email.adminRecipients")) && <p className="field-error">One or more email addresses are invalid.</p>}
          </div>
          {input("email", "fromName", "From name")}
          {input("email", "fromEmail", "From address", { type: "email", help: "Must be verified with your email provider (SPF/DKIM)." })}
          {input("email", "replyTo", "Reply-to address", { type: "email" })}
          {input("email", "smtpHost", "SMTP host", { placeholder: "email-smtp.ap-south-1.amazonaws.com" })}
          {input("email", "smtpPort", "SMTP port", { type: "number" })}
          {input("email", "smtpUser", "SMTP username")}
          <div>
            <label className="field-label" htmlFor="smtp-pass">SMTP password {initial.email.smtpPassEnc && <span className="text-xs font-normal text-muted">(saved — leave blank to keep)</span>}</label>
            <input id="smtp-pass" type="password" autoComplete="new-password" className="field" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-fg"><input type="checkbox" checked={s.email.smtpSecure} onChange={(e) => upd("email", "smtpSecure", e.target.checked)} className="h-4 w-4" /> Use implicit TLS (port 465)</label>
        </div>
        <button type="button" onClick={testEmail} className="btn-outline mt-4">Send test email to me</button>
        <p className="mt-2 text-xs text-muted">Save first, then send a test.</p>
      </Panel>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-600"}`}>{msg.text}</p>}
        <button className="btn-navy" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
      </div>
      {picker && <MediaPicker onClose={() => setPicker(false)} onSelect={(m) => { upd("company", "logoUrl", m.url); setPicker(false); }} />}
    </form>
  );
}
