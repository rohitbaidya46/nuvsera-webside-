import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const APP_URL =
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "Nuvsera Technology — Technology for secure digital finance", template: "%s | Nuvsera Technology" },
  description:
    "Nuvsera Technology Private Limited, Kolkata: custom software, blockchain and crypto exchange development, smart contracts, cybersecurity and fintech platforms. Technology for secure digital finance.",
  applicationName: "Nuvsera Technology",
  formatDetection: { telephone: false },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0e16",
  width: "device-width",
  initialScale: 1,
};

// Applies the saved/system theme before first paint (no flash) and flags JS for reveal animations.
// The public site is always dark (Royal Crest brand); the admin panel follows the saved/system theme.
// "nv-seen" skips the intro preloader after the first page of a visit.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var admin=location.pathname.indexOf('/admin')===0;var t=localStorage.getItem('nv_theme');d.classList.toggle('dark',!admin||t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches));if(sessionStorage.getItem('nv_seen'))d.classList.add('nv-seen')}catch(e){d.classList.add('dark')}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en-IN" className="dark" suppressHydrationWarning>
      <head>
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
