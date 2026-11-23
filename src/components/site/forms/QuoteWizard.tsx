"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import { BUDGET_OPTIONS, TIMELINE_OPTIONS } from "@/lib/constants";
import { ServiceIcon } from "../icons";
import { Captcha, type CaptchaHandle } from "./Captcha";
import { ConsentCheckbox, FormAlert, Honeypot, TextArea, TextField } from "./Fields";
import { useFormSubmit } from "./useFormSubmit";

type Svc = { slug: string; title: string; shortDescription: string; icon: string };

const STEPS = ["Service", "Project details", "Budget & timeline", "Your details"] as const;
const STEP_FIELDS: string[][] = [
  ["service"],
  ["projectType", "message", "platforms", "hasDesigns"],
  ["budget", "timeline"],
  ["name", "company", "email", "phone", "consent", "preferredContact"],
];

const PROJECT_TYPES = [
  { value: "new", label: "A new product or system" },
  { value: "existing", label: "Improve or extend an existing system" },
  { value: "audit", label: "Security audit or code review" },
  { value: "consulting", label: "Consulting / technical advice" },
];
const PLATFORMS = [
  { value: "web", label: "Web" },
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "desktop", label: "Desktop" },
  { value: "backend", label: "Backend / API" },
  { value: "not-sure", label: "Not sure yet" },
];

function RadioCard({ name, value, label, description, icon, defaultChecked }: { name: string; value: string; label: string; description?: string; icon?: string; defaultChecked?: boolean }) {
  return (
    <label className="group relative flex cursor-pointer gap-3 rounded-xl border border-line bg-card p-4 transition has-[:checked]:border-brand has-[:checked]:ring-2 has-[:checked]:ring-brand/30 hover:border-brand/60">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
          <ServiceIcon name={icon} className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-5 text-muted">{description}</span>}
      </span>
      <Check className="absolute right-3 top-3 hidden h-5 w-5 text-brand-700 peer-checked:block dark:text-gold" aria-hidden />
    </label>
  );
}

export function QuoteWizard({ services, defaultService }: { services: Svc[]; defaultService?: string }) {
  const [step, setStep] = useState(0);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const captcha = useRef<CaptchaHandle>(null);
  const { submit, pending, errors: serverErrors, message } = useFormSubmit("/api/leads");
  const errors = { ...serverErrors, ...localErrors };
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const keys = Object.keys(serverErrors);
    if (!keys.length) return;
    const idx = STEP_FIELDS.findIndex((f) => f.some((k) => keys.includes(k)));
    if (idx >= 0) setStep(idx);
  }, [serverErrors]);

  function validate(i: number): boolean {
    const fd = new FormData(formRef.current!);
    const e: Record<string, string> = {};
    if (i === 0 && !fd.get("service")) e.service = "Please choose a service";
    if (i === 1) {
      if (!fd.get("projectType")) e.projectType = "Please choose an option";
      if (String(fd.get("message") || "").trim().length < 10) e.message = "Please describe your project (10+ characters)";
    }
    if (i === 2) {
      if (!fd.get("budget")) e.budget = "Please choose a budget range";
      if (!fd.get("timeline")) e.timeline = "Please choose a timeline";
    }
    if (i === 3) {
      if (String(fd.get("name") || "").trim().length < 2) e.name = "Please enter your name";
      if (!/^\S+@\S+\.\S+$/.test(String(fd.get("email") || ""))) e.email = "Please enter a valid email address";
      if (!/^\+?[0-9 ()-]{7,20}$/.test(String(fd.get("phone") || "").trim())) e.phone = "Please enter a valid phone number";
      if (!fd.get("consent")) e.consent = "Please accept the Privacy Policy to continue";
    }
    setLocalErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    if (!validate(step)) return;
    const fd = new FormData(e.currentTarget);
    fd.set("type", "quote");
    fd.set("captcha", captcha.current?.token() || "");
    const ok = await submit(fd);
    if (!ok) captcha.current?.reset();
  }

  const err = (k: string) => errors[k] && <p className="field-error" role="alert">{errors[k]}</p>;

  return (
    <div>
      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Quote progress">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-gold" : "bg-line"}`} />
            <p className={`mt-2 hidden text-xs font-medium sm:block ${i === step ? "text-fg" : "text-muted"}`}>
              {i + 1}. {label}
            </p>
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

      <form ref={formRef} onSubmit={onSubmit} noValidate className="relative">
        <FormAlert message={message} />

        <fieldset hidden={step !== 0} className="grid gap-4">
          <legend className="mb-4">
            <h2 ref={step === 0 ? headingRef : undefined} tabIndex={-1} className="text-xl font-semibold text-fg">What can we help you with?</h2>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <RadioCard key={s.slug} name="service" value={s.slug} label={s.title} description={s.shortDescription} icon={s.icon} defaultChecked={s.slug === defaultService} />
            ))}
          </div>
          {err("service")}
        </fieldset>

        <fieldset hidden={step !== 1} className="grid gap-6">
          <legend className="mb-4">
            <h2 ref={step === 1 ? headingRef : undefined} tabIndex={-1} className="text-xl font-semibold text-fg">Tell us about the project</h2>
          </legend>
          <div>
            <p className="field-label">What kind of engagement is this? <span className="text-red-600" aria-hidden>*</span></p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROJECT_TYPES.map((p) => <RadioCard key={p.value} name="projectType" value={p.value} label={p.label} />)}
            </div>
            {err("projectType")}
          </div>
          <fieldset>
            <legend className="field-label">Target platforms</legend>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <label key={p.value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/10">
                  <input type="checkbox" name="platforms[]" value={p.value} className="h-4 w-4 accent-[#2a55e0]" /> {p.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="field-label">Do you have designs or a specification?</legend>
            <div className="flex flex-wrap gap-2">
              {[["yes", "Yes"], ["partial", "Partly"], ["no", "Not yet"]].map(([v, l]) => (
                <label key={v} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/10">
                  <input type="radio" name="hasDesigns" value={v} className="h-4 w-4 accent-[#2a55e0]" /> {l}
                </label>
              ))}
            </div>
          </fieldset>
          <TextArea name="message" label="Project summary" required rows={5} placeholder="What problem are you solving? Who are the users? Any must-have features?" error={errors.message} />
          <TextArea name="features" label="Key features or integrations (optional)" rows={3} placeholder="e.g. payment gateway, KYC provider, ERP integration, admin dashboard…" error={errors.features} />
        </fieldset>

        <fieldset hidden={step !== 2} className="grid gap-6">
          <legend className="mb-4">
            <h2 ref={step === 2 ? headingRef : undefined} tabIndex={-1} className="text-xl font-semibold text-fg">Budget and timeline</h2>
          </legend>
          <div>
            <p className="field-label">Indicative budget <span className="text-red-600" aria-hidden>*</span></p>
            <div className="grid gap-3 sm:grid-cols-3">
              {BUDGET_OPTIONS.map((b) => <RadioCard key={b} name="budget" value={b} label={b} />)}
            </div>
            {err("budget")}
          </div>
          <div>
            <p className="field-label">When would you like to start? <span className="text-red-600" aria-hidden>*</span></p>
            <div className="grid gap-3 sm:grid-cols-3">
              {TIMELINE_OPTIONS.map((t) => <RadioCard key={t} name="timeline" value={t} label={t} />)}
            </div>
            {err("timeline")}
          </div>
          <p className="text-sm text-muted">A budget range helps us suggest the right scope. It is not a commitment — every quote is itemised and agreed in writing first.</p>
        </fieldset>

        <fieldset hidden={step !== 3} className="grid gap-5">
          <legend className="mb-4">
            <h2 ref={step === 3 ? headingRef : undefined} tabIndex={-1} className="text-xl font-semibold text-fg">Where should we send your quote?</h2>
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Full name" required autoComplete="name" error={errors.name} />
            <TextField name="company" label="Company" autoComplete="organization" error={errors.company} />
            <TextField name="email" type="email" label="Work email" required autoComplete="email" error={errors.email} />
            <TextField name="phone" type="tel" label="Phone / WhatsApp" required autoComplete="tel" placeholder="+91" error={errors.phone} />
          </div>
          <fieldset>
            <legend className="field-label">Preferred way to reach you</legend>
            <div className="flex flex-wrap gap-2">
              {[["email", "Email"], ["phone", "Phone call"], ["whatsapp", "WhatsApp"]].map(([v, l], i) => (
                <label key={v} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/10">
                  <input type="radio" name="preferredContact" value={v} defaultChecked={i === 0} className="h-4 w-4 accent-[#2a55e0]" /> {l}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="q-attach" className="field-label">Attach a brief (optional)</label>
            <input id="q-attach" name="attachment" type="file" accept=".pdf,.doc,.docx" className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-surface file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-fg" />
            <p className="mt-1.5 text-xs text-muted">PDF, DOC or DOCX — up to 10 MB.</p>
            {err("attachment")}
          </div>
          <Honeypot />
          <ConsentCheckbox error={errors.consent} />
          <Captcha ref={captcha} />
        </fieldset>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <button type="button" className="btn-outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-navy" onClick={next}>
              Continue <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button type="submit" className="btn-gold" disabled={pending}>
              <Send className="h-4 w-4" aria-hidden /> {pending ? "Sending…" : "Request my quote"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
