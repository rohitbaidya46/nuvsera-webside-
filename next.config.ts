import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_OUTPUT=standalone is set by the Dockerfile; Vercel uses its own output.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["sharp", "exceljs"],
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
