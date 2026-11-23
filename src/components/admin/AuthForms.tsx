"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api } from "./api";

function Alert({ msg, tone = "error" }: { msg: string | null; tone?: "error" | "ok" }) {
  if (!msg) return null;
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`mb-4 rounded-lg px-3.5 py-2.5 text-sm ${tone === "error" ? "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"}`}>
      {msg}
    </p>
  );
}

function Field({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label htmlFor={props.id} className="field-label">{label}</label>
      <input {...props} className="field" aria-invalid={!!error} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

const PW_HINT = "At least 12 characters with upper- and lowercase letters, a number and a symbol.";

export function LoginForm() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    try {
      const r = await api<{ next: string }>("/api/admin/auth/login", { body: { email: fd.get("email"), password: fd.get("password") } });
      router.replace(r.next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert msg={err} />
      <Field id="email" name="email" type="email" label="Email" autoComplete="username" required />
      <Field id="password" name="password" type="password" label="Password" autoComplete="current-password" required />
      <button className="btn-navy w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm"><Link href="/admin/forgot-password" className="link">Forgot your password?</Link></p>
    </form>
  );
}

export function TwoFactorForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "setup" | "verify">("loading");
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [next, setNext] = useState("/admin");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ mode: "setup" | "verify"; qr?: string; secret?: string }>("/api/admin/auth/two-factor")
      .then((r) => {
        setMode(r.mode);
        if (r.qr && r.secret) setSetup({ qr: r.qr, secret: r.secret });
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") || "");
    setBusy(true);
    setErr(null);
    try {
      const r = await api<{ next: string; recoveryCodes?: string[] }>("/api/admin/auth/two-factor", { body: { code } });
      if (r.recoveryCodes) {
        setCodes(r.recoveryCodes);
        setNext(r.next);
      } else router.replace(r.next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Verification failed");
      if (e instanceof ApiError && e.status === 423) setTimeout(() => router.replace("/admin/login"), 2500);
    } finally {
      setBusy(false);
    }
  }

  if (codes)
    return (
      <div>
        <Alert tone="ok" msg="Two-factor authentication is now enabled." />
        <p className="text-sm text-muted">Save these one-time recovery codes somewhere safe (e.g. a password manager). Each can be used once if you lose access to your authenticator app. They will not be shown again.</p>
        <ul className="my-4 grid grid-cols-2 gap-2 rounded-lg bg-surface p-4 font-mono text-sm text-fg">{codes.map((c) => <li key={c}>{c}</li>)}</ul>
        <button className="btn-navy w-full" onClick={() => router.replace(next)}>I have saved my codes — continue</button>
      </div>
    );

  if (mode === "loading") return <p className="text-sm text-muted">Loading…</p>;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert msg={err} />
      {mode === "setup" && setup && (
        <div className="space-y-3 text-sm text-muted">
          <p>Two-factor authentication is required for all admin accounts. Scan this QR code with Google Authenticator, Microsoft Authenticator, Authy or a similar app, then enter the 6-digit code.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} alt="QR code for your authenticator app" width={220} height={220} className="mx-auto rounded-lg bg-white p-2" />
          <p>Can’t scan? Enter this key manually:<br /><code className="break-all rounded bg-surface px-2 py-1 text-xs text-fg">{setup.secret}</code></p>
        </div>
      )}
      {mode === "verify" && <p className="text-sm text-muted">Enter the 6-digit code from your authenticator app, or one of your recovery codes.</p>}
      <Field id="code" name="code" label="Verification code" inputMode="numeric" autoComplete="one-time-code" required autoFocus maxLength={20} />
      <button className="btn-navy w-full" disabled={busy}>{busy ? "Verifying…" : "Verify"}</button>
    </form>
  );
}

export function ChangePasswordForm({ reason }: { reason?: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) return setFields({ confirm: "Passwords do not match" });
    setBusy(true);
    setErr(null);
    setFields({});
    try {
      const r = await api<{ next: string }>("/api/admin/auth/change-password", { body: { current: fd.get("current"), password: fd.get("password") } });
      router.replace(r.next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
      if (e instanceof ApiError) setFields(e.fields);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {reason && <Alert tone="ok" msg={reason} />}
      <Alert msg={err} />
      <Field id="current" name="current" type="password" label="Current password" autoComplete="current-password" required error={fields.current} />
      <Field id="password" name="password" type="password" label="New password" autoComplete="new-password" required error={fields.password} />
      <p className="-mt-2 text-xs text-muted">{PW_HINT}</p>
      <Field id="confirm" name="confirm" type="password" label="Confirm new password" autoComplete="new-password" required error={fields.confirm} />
      <button className="btn-navy w-full" disabled={busy}>{busy ? "Saving…" : "Change password"}</button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await api("/api/admin/auth/forgot-password", { body: { email: new FormData(e.currentTarget).get("email") } });
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }
  if (done) return <Alert tone="ok" msg="If an account exists for that email, a reset link has been sent. It is valid for 1 hour." />;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert msg={err} />
      <Field id="email" name="email" type="email" label="Email" autoComplete="username" required />
      <button className="btn-navy w-full">Send reset link</button>
      <p className="text-center text-sm"><Link href="/admin/login" className="link">Back to sign in</Link></p>
    </form>
  );
}

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") || "";
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) return setFields({ confirm: "Passwords do not match" });
    try {
      await api("/api/admin/auth/reset-password", { body: { token, password: fd.get("password") } });
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
      if (e instanceof ApiError) setFields(e.fields);
    }
  }
  if (done) return <div><Alert tone="ok" msg="Your password has been reset. Please sign in." /><Link href="/admin/login" className="btn-navy w-full">Sign in</Link></div>;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Alert msg={err} />
      <Field id="password" name="password" type="password" label="New password" autoComplete="new-password" required error={fields.password} />
      <p className="-mt-2 text-xs text-muted">{PW_HINT}</p>
      <Field id="confirm" name="confirm" type="password" label="Confirm new password" autoComplete="new-password" required error={fields.confirm} />
      <button className="btn-navy w-full">Set new password</button>
    </form>
  );
}
