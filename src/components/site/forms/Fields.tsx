"use client";
import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";

type Base = { name: string; label: string; error?: string; required?: boolean; hint?: string };

function Wrap({ id, label, required, error, hint, children }: Base & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-red-600" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export function TextField(props: Base & { type?: string; autoComplete?: string; placeholder?: string; defaultValue?: string; inputMode?: "tel" | "email" | "text" | "url" }) {
  const id = useId();
  const { name, required, error, hint, type = "text", ...rest } = props;
  return (
    <Wrap id={id} {...props}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className="field"
        autoComplete={rest.autoComplete}
        placeholder={rest.placeholder}
        defaultValue={rest.defaultValue}
        inputMode={rest.inputMode}
      />
    </Wrap>
  );
}

export function TextArea(props: Base & { rows?: number; placeholder?: string; defaultValue?: string }) {
  const id = useId();
  return (
    <Wrap id={id} {...props}>
      <textarea
        id={id}
        name={props.name}
        rows={props.rows ?? 5}
        required={props.required}
        aria-invalid={!!props.error}
        aria-describedby={props.error ? `${id}-err` : undefined}
        className="field"
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
      />
    </Wrap>
  );
}

export function SelectField(props: Base & { options: { value: string; label: string }[]; defaultValue?: string; placeholder?: string; onChange?: (value: string) => void }) {
  const id = useId();
  return (
    <Wrap id={id} {...props}>
      <select
        id={id}
        name={props.name}
        required={props.required}
        aria-invalid={!!props.error}
        aria-describedby={props.error ? `${id}-err` : undefined}
        className="field"
        defaultValue={props.defaultValue ?? ""}
        onChange={props.onChange ? (e) => props.onChange!(e.target.value) : undefined}
      >
        <option value="" disabled>{props.placeholder ?? "Please select"}</option>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Wrap>
  );
}

export function FileField(props: Base & { accept: string }) {
  const id = useId();
  return (
    <Wrap id={id} {...props}>
      <input
        id={id}
        name={props.name}
        type="file"
        accept={props.accept}
        required={props.required}
        aria-invalid={!!props.error}
        aria-describedby={props.error ? `${id}-err` : `${id}-hint`}
        className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-surface file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-fg hover:file:bg-line"
      />
    </Wrap>
  );
}

/** Hidden from humans and assistive tech; bots tend to fill it. */
export function Honeypot() {
  const [startedAt, setStartedAt] = useState("");
  useEffect(() => setStartedAt(String(Date.now())), []);
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
      <input type="hidden" name="startedAt" value={startedAt} readOnly />
    </div>
  );
}

export function ConsentCheckbox({ error, text }: { error?: string; text?: ReactNode }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-3">
        <input id={id} name="consent" type="checkbox" required aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="mt-1 h-4 w-4 shrink-0 accent-[#2a55e0]" />
        <label htmlFor={id} className="text-sm leading-6 text-muted">
          {text ?? (
            <>
              I agree to the <Link href="/privacy-policy" className="link" target="_blank">Privacy Policy</Link> and to be contacted by Nuvsera Technology about my enquiry.
            </>
          )}{" "}
          <span className="text-red-600" aria-hidden>*</span>
        </label>
      </div>
      {error && <p id={`${id}-err`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
      {message}
    </div>
  );
}
