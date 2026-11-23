import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "Nuvsera Technology — Custom Software, Blockchain & Cybersecurity", template: "%s | Nuvsera Technology" },
  description:
    "Nuvsera Technology Private Limited, Kolkata: custom software, web and mobile apps, blockchain and crypto exchange development, AI integration, cybersecurity audits and data analytics.",
  applicationName: "Nuvsera Technology",
  formatDetection: { telephone: false },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060e20" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Applies the saved/system theme before first paint (no flash) and flags JS for reveal animations.
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('nv_theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark')}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
