"use client";
import { useRef } from "react";
import { Send } from "lucide-react";
import { Captcha, type CaptchaHandle } from "./Captcha";
import { ConsentCheckbox, FileField, FormAlert, Honeypot, SelectField, TextArea, TextField } from "./Fields";
import { useFormSubmit } from "./useFormSubmit";
import Link from "next/link";

export function ApplicationForm({ jobId, jobs }: { jobId?: string; jobs?: { id: string; title: string }[] }) {
  const { submit, pending, errors, message } = useFormSubmit("/api/careers/apply");
  const captcha = useRef<CaptchaHandle>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cv = fd.get("cv");
    if (!(cv instanceof File) || cv.size === 0) {
      alert("Please attach your CV (PDF, DOC or DOCX).");
      return;
    }
    if (cv.size > 10 * 1024 * 1024) {
      alert("Your CV must be 10 MB or smaller.");
      return;
    }
    if (jobId) fd.set("jobId", jobId);
    fd.set("captcha", captcha.current?.token() || "");
    const ok = await submit(fd);
    if (!ok) captcha.current?.reset();
  }
  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      <FormAlert message={message} />
      {!jobId && jobs && (
        <SelectField
          name="jobId"
          label="Position"
          placeholder="General application"
          options={jobs.map((j) => ({ value: j.id, label: j.title }))}
          error={errors.jobId}
        />
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" required autoComplete="name" error={errors.name} />
        <TextField name="email" type="email" label="Email" required autoComplete="email" error={errors.email} />
        <TextField name="phone" type="tel" label="Phone" required autoComplete="tel" error={errors.phone} />
        <TextField name="location" label="Current city" autoComplete="address-level2" error={errors.location} />
        <TextField name="experience" label="Years of experience" placeholder="e.g. 3" error={errors.experience} />
        <TextField name="linkedin" type="url" label="LinkedIn profile" placeholder="https://" error={errors.linkedin} />
      </div>
      <TextField name="portfolio" type="url" label="Portfolio / GitHub (optional)" placeholder="https://" error={errors.portfolio} />
      <TextArea name="coverLetter" label="Why would you like to join us? (optional)" rows={5} error={errors.coverLetter} />
      <FileField name="cv" label="CV / Résumé" required accept=".pdf,.doc,.docx" hint="PDF, DOC or DOCX — up to 10 MB." error={errors.cv} />
      <Honeypot />
      <ConsentCheckbox
        error={errors.consent}
        text={<>I consent to Nuvsera Technology processing my application data for recruitment as described in the <Link href="/privacy-policy" className="link" target="_blank">Privacy Policy</Link>.</>}
      />
      <Captcha ref={captcha} />
      <div>
        <button type="submit" className="btn-gold" disabled={pending}>
          <Send className="h-4 w-4" aria-hidden /> {pending ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
