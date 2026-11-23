"use client";
import Link from "next/link";
import { useState } from "react";
import { useFormSubmit } from "./useFormSubmit";

export function NewsletterForm() {
  const { submit, pending, errors, message } = useFormSubmit("/api/newsletter");
  const [done, setDone] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submit(new FormData(e.currentTarget), { onSuccess: () => setDone(true) });
  }
  if (done)
    return <p role="status" className="rounded-lg bg-white/10 p-3 text-sm text-white">Thank you — please check your inbox to confirm your subscription.</p>;
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3">
      <div className="flex gap-2">
        <label htmlFor="nl-email" className="sr-only">Email address</label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          className="min-h-11 w-full min-w-0 rounded-lg border border-white/20 bg-white/5 px-3.5 text-sm text-white placeholder:text-slate-400 focus:border-gold focus:outline-none"
        />
        <button type="submit" disabled={pending} className="btn-gold shrink-0">{pending ? "…" : "Subscribe"}</button>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="flex items-start gap-2 text-xs leading-5 text-slate-300">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#E3A93B]" />
        <span>I agree to receive occasional insights by email and accept the <Link href="/privacy-policy" className="underline">Privacy Policy</Link>. Unsubscribe any time.</span>
      </label>
      {(message || errors.email || errors.consent) && (
        <p role="alert" className="text-xs text-red-300">{errors.email || errors.consent || message}</p>
      )}
    </form>
  );
}
