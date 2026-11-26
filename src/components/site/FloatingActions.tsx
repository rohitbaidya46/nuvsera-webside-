"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Phone } from "lucide-react";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 6.68 2.77 9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.67 5.8.67 12.07c0 2 .52 3.96 1.52 5.69L.57 23.7l6.08-1.6a11.36 11.36 0 0 0 5.4 1.38h.01c6.27 0 11.38-5.1 11.38-11.37 0-3.04-1.18-5.9-3.33-8.05" />
    </svg>
  );
}

export function FloatingActions({ whatsapp, phone }: { whatsapp: string; phone: string }) {
  const pathname = usePathname();
  const onQuote = pathname.startsWith("/get-a-quote") || pathname.startsWith("/thank-you");
  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Nuvsera Technology, I would like to discuss a project.")}`;
  const tel = `tel:${phone.replace(/\s/g, "")}`;
  return (
    <>
      {/* Desktop: sticky quote tab + WhatsApp bubble */}
      {!onQuote && (
        <Link
          href="/get-a-quote"
          className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 rotate-180 rounded-r-lg bg-gradient-to-b from-gold-300 via-gold to-gold-700 px-2.5 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-navy shadow-lg transition [writing-mode:vertical-rl] hover:brightness-110 md:block"
        >
          Start a Project
        </Link>
      )}
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-navy text-gold shadow-[0_10px_40px_-8px_rgba(227,169,59,0.45)] transition hover:scale-105 hover:bg-gold hover:text-navy md:flex"
        aria-label="Chat with us on WhatsApp (opens in a new tab)"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>

      {/* Mobile: bottom action bar with click-to-call, WhatsApp and quote */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-gold/20 bg-navy/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <a href={tel} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium text-fg">
          <Phone className="h-5 w-5 text-gold" aria-hidden /> Call
        </a>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium text-fg">
          <WhatsAppIcon className="h-5 w-5 text-gold" /> WhatsApp
        </a>
        <Link href="/get-a-quote" className="flex min-h-14 flex-col items-center justify-center gap-0.5 bg-gold text-xs font-semibold text-navy">
          <FileText className="h-5 w-5" aria-hidden /> Start a Project
        </Link>
      </div>
    </>
  );
}
