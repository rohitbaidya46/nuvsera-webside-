import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { LogoMark } from "./Logo";
import { CookieSettingsLink } from "./ConsentManager";
import { NewsletterForm } from "./forms/NewsletterForm";

const SOCIAL_LABELS: Record<keyof SiteSettings["social"], string> = {
  linkedin: "LinkedIn", x: "X (Twitter)", facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", github: "GitHub",
};

export function Footer({ settings, services }: { settings: SiteSettings; services: { slug: string; title: string }[] }) {
  const c = settings.company;
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof SiteSettings["social"])[]).filter((k) => settings.social[k]);
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy pb-24 text-slate-300 md:pb-0" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* Contact strip */}
      <div className="border-b border-white/10">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-3">
          <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-lg hover:text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-gold"><Phone className="h-5 w-5" aria-hidden /></span>
            <span><span className="block text-xs uppercase tracking-wider text-slate-400">Call / WhatsApp</span><span className="font-semibold text-white">{c.phone}</span></span>
          </a>
          <a href={`mailto:${c.email}`} className="flex items-center gap-3 rounded-lg hover:text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-gold"><Mail className="h-5 w-5" aria-hidden /></span>
            <span><span className="block text-xs uppercase tracking-wider text-slate-400">Email</span><span className="font-semibold text-white break-all">{c.email}</span></span>
          </a>
          <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg hover:text-white">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold"><MapPin className="h-5 w-5" aria-hidden /></span>
            <span><span className="block text-xs uppercase tracking-wider text-slate-400">Visit us</span><span className="font-semibold text-white">Park Street, Kolkata</span></span>
          </a>
        </div>
      </div>

      <div className="container-x grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded">
            <LogoMark />
            <span className="text-lg font-bold text-white">Nuvsera <span className="font-semibold text-slate-400">Technology</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6">{c.tagline} Parent company of the NS Exchange crypto exchange platform.</p>
          <address className="mt-5 text-sm not-italic leading-6">
            {c.legalName}<br />
            {c.addressLine1}, {c.addressLine2},<br />
            {c.city} – {c.postalCode}, {c.state}, {c.country}
          </address>
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-3 text-sm">
              {socials.map((k) => (
                <li key={k}><a href={settings.social[k]} target="_blank" rel="noopener noreferrer me" className="underline-offset-4 hover:text-white hover:underline">{SOCIAL_LABELS[k]}</a></li>
              ))}
            </ul>
          )}
        </div>

        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5" aria-label="Footer">
          <div>
            <h3 className="text-sm font-semibold text-white">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`} className="hover:text-white">{s.title}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[["/about", "About Us"], ["/products/ns-exchange", "NS Exchange"], ["/portfolio", "Portfolio"], ["/process", "Our Process"], ["/careers", "Careers"], ["/blog", "Insights"], ["/contact", "Contact Us"], ["/get-a-quote", "Get a Quote"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="hover:text-white">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link href="/refund-and-cancellation-policy" className="hover:text-white">Refund &amp; Cancellation</Link></li>
              <li><CookieSettingsLink className="text-left hover:text-white" /></li>
            </ul>
          </div>
        </nav>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-white">Insights in your inbox</h3>
          <p className="mt-2 text-sm leading-6">Practical notes on software, blockchain and security. One email a month, at most.</p>
          <div className="mt-4"><NewsletterForm /></div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs leading-5 text-slate-400 lg:flex-row lg:items-center lg:justify-between">
          <p>© {year} {c.legalName}. All rights reserved.</p>
          <dl className="flex flex-wrap gap-x-5 gap-y-1">
            <div className="flex gap-1"><dt>CIN:</dt><dd className="font-medium text-slate-300">{c.cin}</dd></div>
            <div className="flex gap-1"><dt>GSTIN:</dt><dd className="font-medium text-slate-300">{c.gstin}</dd></div>
            <div className="flex gap-1"><dt>Udyam:</dt><dd className="font-medium text-slate-300">{c.udyam} ({c.udyamCategory})</dd></div>
          </dl>
        </div>
      </div>
    </footer>
  );
}
