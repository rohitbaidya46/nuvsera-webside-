"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readAttribution } from "../AttributionTracker";

export type FieldErrors = Record<string, string>;

/** Shared submit logic: posts multipart form data with attribution, handles validation errors, redirects on success. */
export function useFormSubmit(endpoint: string) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  async function submit(fd: FormData, opts: { onSuccess?: (data: { redirect?: string }) => void } = {}) {
    setPending(true);
    setErrors({});
    setMessage(null);
    fd.set("attribution", readAttribution());
    try {
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors; redirect?: string };
      if (!res.ok || !data.ok) {
        setErrors(data.fields || {});
        setMessage(data.error || "Something went wrong. Please try again.");
        return false;
      }
      if (opts.onSuccess) opts.onSuccess(data);
      else if (data.redirect) {
        try {
          sessionStorage.setItem("nv_conv_pending", "1");
        } catch {}
        router.push(data.redirect);
      }
      return true;
    } catch {
      setMessage("Network error — please check your connection and try again.");
      return false;
    } finally {
      setPending(false);
    }
  }
  return { submit, pending, errors, setErrors, message, setMessage };
}
