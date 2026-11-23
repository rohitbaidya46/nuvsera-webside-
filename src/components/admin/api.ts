"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}) {
    super(message);
  }
}

/** JSON fetch helper for admin screens. Redirects to login when the session has expired. */
export async function api<T = Record<string, unknown>>(url: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const res = await fetch(url, {
    method: opts.method ?? (opts.body || opts.form ? "POST" : "GET"),
    headers: opts.form ? undefined : { "content-type": "application/json" },
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !url.includes("/auth/")) {
    window.location.href = "/admin/login";
  }
  if (!res.ok || data.ok === false) throw new ApiError(data.error || "Request failed", res.status, data.fields);
  return data as T;
}
