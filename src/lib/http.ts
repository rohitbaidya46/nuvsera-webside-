import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function handleError(err: unknown) {
  if (err instanceof HttpError) {
    return json({ ok: false, error: err.message, fields: err.fields }, err.status);
  }
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const k = issue.path.join(".") || "_";
      if (!fields[k]) fields[k] = issue.message;
    }
    return json({ ok: false, error: "Please check the highlighted fields.", fields }, 422);
  }
  console.error(err);
  return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
}

/** Wraps a route handler with uniform error handling. */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      return handleError(err);
    }
  };
}

export async function clientIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip");
}

export async function userAgent(): Promise<string | null> {
  return ((await headers()).get("user-agent") || "").slice(0, 300) || null;
}
