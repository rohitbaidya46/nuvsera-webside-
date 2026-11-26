import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_OUTPUT=standalone is set by the Dockerfile; Vercel uses its own output.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // Lets a second dev server run beside a production build (e.g. NEXT_DIST_DIR=.next-dev npm run dev -- -p 3001).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["sharp", "exceljs"],
  // exceljs pulls in packages that Node 22 loads via the "module-sync" export condition, which Next's
  // file tracer does not follow. Without this, standalone/Vercel builds crash on CSV/Excel export.
  outputFileTracingIncludes: {
    "/api/admin/**": ["./node_modules/generator-function/**/*", "./node_modules/async-function/**/*"],
  },
  async headers() {
    // CSP and the main security headers are set per request in src/middleware.ts.
    return [
      {
        source: "/media/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
        ],
      },
    ];
  },
};

export default nextConfig;
