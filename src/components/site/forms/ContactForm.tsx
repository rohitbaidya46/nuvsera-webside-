"use client";
import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { AUDIT_CHAINS, BUDGET_OPTIONS, CONTRACT_SERVICES, TIMELINE_OPTIONS } from "@/lib/constants";
import { Captcha, type CaptchaHandle } from "./Captcha";
import { ConsentCheckbox, FileField, FormAlert, Honeypot, SelectField, TextArea, TextField } from "./Fields";
import { useFormSubmit } from "./useFormSubmit";

export function ContactForm({ services, defaultService }: { services: { slug: string; title: string }[]; defaultService?: string }) {
  const { submit, pending, errors, message } = useFormSubmit("/api/leads");
  const [service, setService] = useState(defaultService ?? "");
  const needsContract = CONTRACT_SERVICES.includes(service);
  const captcha = useRef<CaptchaHandle>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("attachment");
    if (file instanceof File && file.size > 10 * 1024 * 1024) {
      alert("The attachment must be 10 MB or smaller.");
      return;
    }
    fd.set("type", "contact");
    fd.set("captcha", captcha.current?.token() || "");
    const ok = await submit(fd);
    if (!ok) captcha.current?.reset();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5" aria-describedby="contact-required-note">
      <p id="contact-required-note" className="text-sm text-muted">Fields marked <span className="text-red-600">*</span> are required.</p>
      <FormAlert message={message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" required autoComplete="name" error={errors.name} />
        <TextField name="company" label="Company" autoComplete="organization" error={errors.company} />
        <TextField name="email" type="email" label="Work email" required autoComplete="email" inputMode="email" error={errors.email} />
        <TextField name="phone" type="tel" label="Phone / WhatsApp" required autoComplete="tel" inputMode="tel" placeholder="+91" error={errors.phone} />
      </div>
      <SelectField
        name="service"
        label="Service you are interested in"
        required
        defaultValue={defaultService}
        options={services.map((s) => ({ value: s.slug, label: s.title }))}
        error={errors.service}
        onChange={setService}
      />
      {needsContract && (
        <div className="grid gap-5 rounded-2xl border border-gold/25 bg-gold/[0.03] p-4 sm:grid-cols-[1fr_2fr]">
          <SelectField name="chain" label="Blockchain" options={AUDIT_CHAINS.map((c) => ({ value: c, label: c }))} error={errors.chain} />
          <TextField name="contractAddress" label="Contract address (if deployed)" placeholder="0x… or T…" autoComplete="off" error={errors.contractAddress} />
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField name="budget" label="Budget range" required options={BUDGET_OPTIONS.map((b) => ({ value: b, label: b }))} error={errors.budget} />
        <SelectField name="timeline" label="Timeline" required options={TIMELINE_OPTIONS.map((t) => ({ value: t, label: t }))} error={errors.timeline} />
      </div>
      <TextArea name="message" label="Tell us about your project" required rows={6} placeholder="Goals, key features, integrations, anything else we should know…" error={errors.message} />
      <FileField
        name="attachment"
        label="Attach a brief or RFP (optional)"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hint="PDF, DOC or DOCX — up to 10 MB."
        error={errors.attachment}
      />
      <Honeypot />
      <ConsentCheckbox error={errors.consent} />
      <Captcha ref={captcha} />
      <div>
        <button type="submit" className="btn-gold w-full sm:w-auto" disabled={pending}>
          <Send className="h-4 w-4" aria-hidden />
          {pending ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
