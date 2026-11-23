import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "./lib/session-cookie";

/**
 * Runs on every request:
 *  - generates a per-request CSP nonce and sets a strict Content-Security-Policy
 *  - adds security headers (OWASP secure headers)
 *  - blocks cross-site state-changing API requests (CSRF defence in depth on top of SameSite cookies)
 *  - redirects unauthenticated visitors away from /admin (real authorisation happens server-side)
 */
const PUBLIC_ADMIN = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

function buildCsp(nonce: string, isDev: boolean) {
  const google = "https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://googleads.g.doubleclick.net https://*.g.doubleclick.net https://www.google.com https://www.google.co.in https://www.googleadservices.com";
  const linkedin = "https://snap.licdn.com https://px.ads.linkedin.com https://*.linkedin.com";
  const hcaptcha = "https://hcaptcha.com https://*.hcaptcha.com";
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""} https: 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline' ${hcaptcha}`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' ${google} ${linkedin} ${hcaptcha}${isDev ? " ws:" : ""}`,
    `frame-src ${hcaptcha} https://td.doubleclick.net https://www.googletagmanager.com`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isDev = process.env.NODE_ENV !== "production";

  // CSRF: state-changing API calls must originate from this site.
  if (pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(req.method) && !pathname.startsWith("/api/cron/")) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (!origin || !host || new URL(origin).host !== host) {
      return NextResponse.json({ ok: false, error: "Cross-site request blocked" }, { status: 403 });
    }
  }

  // Cheap gate for admin pages (full checks run in server components and API routes).
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN.some((p) => pathname.startsWith(p)) && !req.cookies.has(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, isDev);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);
  requestHeaders.set("x-pathname", pathname);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (!isDev) res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
  }
  return res;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|icon.svg|media/).*)",
      missing: [{ type: "header", key: "next-router-prefetch" }],
    },
  ],
};
