"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Cookie consent aligned with India's Digital Personal Data Protection Act, 2023:
 *  - free, specific, informed, unambiguous: nothing non-essential loads before an affirmative choice
 *  - "Reject all" is as prominent as "Accept all"
 *  - consent can be withdrawn at any time via "Cookie settings" in the footer
 *  - every choice is recorded server-side (anonymous ID, categories, timestamp, policy version)
 * GA4 / Google Ads / LinkedIn Insight load only after consent for their category.
 */
export type Tracking = {
  ga4Id: string;
  googleAdsId: string;
  googleAdsLeadLabel: string;
  linkedinPartnerId: string;
  linkedinConversionId: string;
};
type Consent = { v: string; id: string; analytics: boolean; marketing: boolean; t: number };

const COOKIE = "nv_consent";
const VERSION = "2026-11";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    lintrk?: ((a: string, b: Record<string, unknown>) => void) & { q?: unknown[] };
    _linkedin_data_partner_ids?: string[];
    __nvTracking?: Tracking;
  }
}

function readConsent(): Consent | null {
  const m = document.cookie.match(/(?:^|; )nv_consent=([^;]+)/);
  if (!m) return null;
  try {
    const c = JSON.parse(decodeURIComponent(m[1])) as Consent;
    return c.v === VERSION ? c : null;
  } catch {
    return null;
  }
}

function writeConsent(c: Consent) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(c))}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${secure}`;
}

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.id = id;
  document.head.appendChild(s);
}

function applyConsent(c: Consent, t: Tracking) {
  window.__nvTracking = t;
  const wantsGoogle = (c.analytics && t.ga4Id) || (c.marketing && t.googleAdsId);
  if (wantsGoogle) {
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line prefer-rest-params
    window.gtag = window.gtag || function gtag() { window.dataLayer!.push(arguments); };
    window.gtag("consent", "default", {
      ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied",
    });
    window.gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied",
    });
    window.gtag("js", new Date());
    if (c.analytics && t.ga4Id) window.gtag("config", t.ga4Id, { anonymize_ip: true });
    if (c.marketing && t.googleAdsId) window.gtag("config", t.googleAdsId);
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(t.ga4Id || t.googleAdsId)}`, "nv-gtag");
  }
  if (c.marketing && t.linkedinPartnerId) {
    window._linkedin_data_partner_ids = [t.linkedinPartnerId];
    if (!window.lintrk) {
      const q: unknown[] = [];
      const f = ((a: string, b: Record<string, unknown>) => q.push([a, b])) as Window["lintrk"] & object;
      f.q = q;
      window.lintrk = f;
    }
    loadScript("https://snap.licdn.com/li.lms-analytics/insight.min.js", "nv-linkedin");
  }
}

/** Fires lead conversion events (called from the thank-you page). Respects consent. */
export function trackLeadConversion(kind: string) {
  const c = typeof document !== "undefined" ? readConsent() : null;
  const t = window.__nvTracking;
  if (!c || !t) return;
  if (c.analytics && window.gtag && t.ga4Id) window.gtag("event", "generate_lead", { lead_type: kind });
  if (c.marketing && window.gtag && t.googleAdsId && t.googleAdsLeadLabel)
    window.gtag("event", "conversion", { send_to: `${t.googleAdsId}/${t.googleAdsLeadLabel}` });
  if (c.marketing && window.lintrk && t.linkedinConversionId)
    window.lintrk("track", { conversion_id: Number(t.linkedinConversionId) });
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("nv:cookie-settings"));
}

export function ConsentManager({ tracking }: { tracking: Tracking }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = readConsent();
    if (c) {
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
      applyConsent(c, tracking);
    } else {
      window.__nvTracking = tracking;
      setOpen(true);
    }
    const onOpen = () => {
      setOpen(true);
      setSettings(true);
    };
    window.addEventListener("nv:cookie-settings", onOpen);
    return () => window.removeEventListener("nv:cookie-settings", onOpen);
  }, [tracking]);

  useEffect(() => {
    if (settings) dialogRef.current?.querySelector<HTMLElement>("input,button")?.focus();
  }, [settings]);

  const save = useCallback(
    (a: boolean, m: boolean, action: string) => {
      const prev = readConsent();
      const c: Consent = { v: VERSION, id: prev?.id || crypto.randomUUID(), analytics: a, marketing: m, t: Date.now() };
      const withdrew = prev && ((prev.analytics && !a) || (prev.marketing && !m));
      writeConsent(c);
      setAnalytics(a);
      setMarketing(m);
      setOpen(false);
      setSettings(false);
      fetch("/api/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consentId: c.id, analytics: a, marketing: m, action, version: VERSION }),
        keepalive: true,
      }).catch(() => {});
      if (withdrew) window.location.reload(); // unload previously loaded trackers
      else applyConsent(c, tracking);
    },
    [tracking],
  );

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal={settings ? "true" : "false"}
      aria-labelledby="cookie-title"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
      onKeyDown={(e) => e.key === "Escape" && settings && setSettings(false)}
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-card p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="cookie-title" className="text-base font-semibold text-fg">
            {settings ? "Cookie settings" : "Your privacy choices"}
          </h2>
          {settings && (
            <button type="button" onClick={() => setSettings(false)} className="rounded p-1 text-muted hover:text-fg" aria-label="Close settings">
              <X className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">
          We use strictly necessary cookies to run this website. With your permission we would also like to use analytics
          cookies to understand how the site is used, and marketing cookies to measure our advertising. You can change your
          choice at any time from “Cookie settings” in the footer. Read our{" "}
          <Link href="/privacy-policy#cookies" className="link">Privacy Policy</Link>.
        </p>

        {settings && (
          <fieldset className="mt-4 space-y-3">
            <legend className="sr-only">Cookie categories</legend>
            <label className="flex items-start gap-3 rounded-lg bg-surface p-3">
              <input type="checkbox" checked disabled className="mt-1 h-4 w-4" />
              <span className="text-sm">
                <strong className="block text-fg">Strictly necessary</strong>
                <span className="text-muted">Security, load balancing and remembering your cookie choice. Always on.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg bg-surface p-3">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 h-4 w-4 accent-[#2a55e0]" />
              <span className="text-sm">
                <strong className="block text-fg">Analytics</strong>
                <span className="text-muted">Google Analytics 4 — aggregated, IP-anonymised usage statistics.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg bg-surface p-3">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-1 h-4 w-4 accent-[#2a55e0]" />
              <span className="text-sm">
                <strong className="block text-fg">Marketing</strong>
                <span className="text-muted">Google Ads and LinkedIn Insight Tag — measure ad conversions.</span>
              </span>
            </label>
          </fieldset>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {settings ? (
            <button type="button" className="btn-outline" onClick={() => save(analytics, marketing, "custom")}>
              Save my choices
            </button>
          ) : (
            <button type="button" className="btn-outline" onClick={() => setSettings(true)}>
              Settings
            </button>
          )}
          <button type="button" className="btn-outline" onClick={() => save(false, false, "reject_all")}>
            Reject all
          </button>
          <button type="button" className="btn-navy" onClick={() => save(true, true, "accept_all")}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  );
}
