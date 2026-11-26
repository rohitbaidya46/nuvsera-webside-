import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { GoldRule } from "@/components/experience/SplitText";
import type { SiteSettings } from "@/lib/settings";
import { CookieSettingsLink } from "./ConsentManager";
import { NewsletterForm } from "./forms/NewsletterForm";
import { WhatsAppIcon } from "./FloatingActions";
import { Logo } from "./Logo";

const SOCIAL_LABELS: Record<keyof SiteSettings["social"], string> = {
  linkedin: "LinkedIn", x: "X (Twitter)", facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", github: "GitHub",
};

export function Footer({ settings, services }: { settings: SiteSettings; services: { slug: string; title: string }[] }) {
  const c = settings.company;
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof SiteSettings["social"])[]).filter((k) => settings.social[k]);
  const year = new Date().getFullYear();
  const tel = `tel:${c.phone.replace(/\s/g, "")}`;
  const emails = [
    { label: "General", email: c.email },
    { label: "Support", email: c.supportEmail },
    { label: "Projects", email: c.projectsEmail },
  ].filter((e) => e.email);
  return (
    <footer className="relative bg-navy pb-24 text-muted md:pb-0" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <GoldRule />

      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <a href={tel} className="group flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-navy"><Phone className="h-5 w-5" aria-hidden /></span>
          <span><span className="block text-[11px] uppercase tracking-[0.25em]">Call</span><span className="font-semibold text-ivory">{c.phone}</span></span>
        </a>
        <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-navy"><WhatsAppIcon className="h-5 w-5" /></span>
          <span><span className="block text-[11px] uppercase tracking-[0.25em]">WhatsApp</span><span className="font-semibold text-ivory">{c.phone}</span></span>
        </a>
        <a href={`mailto:${c.email}`} className="group flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-navy"><Mail className="h-5 w-5" aria-hidden /></span>
          <span><span className="block text-[11px] uppercase tracking-[0.25em]">Email</span><span className="text-[15px] font-semibold text-ivory [overflow-wrap:anywhere]">{c.email}</span></span>
        </a>
        <a href={c.mapUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-navy"><MapPin className="h-5 w-5" aria-hidden /></span>
          <span><span className="block text-[11px] uppercase tracking-[0.25em]">Visit</span><span className="font-semibold text-ivory">OM Tower, Park Street, Kolkata</span></span>
        </a>
      </div>

      <GoldRule />

      <div className="container-x grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="inline-flex rounded" aria-label="Nuvsera Technology Private Limited, home"><Logo logoUrl={c.logoUrl || undefined} /></Link>
          <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-ivory">{c.tagline}.</p>
          <p className="mt-3 max-w-sm text-sm leading-6">
            Custom software, blockchain and cybersecurity. Builders and owners of{" "}
            <a href="https://nsexchange.com" target="_blank" rel="noopener" className="text-gold underline underline-offset-4">NS Exchange</a>.
          </p>
          <address className="mt-6 text-sm not-italic leading-6">
            {c.legalName}<br />
            {c.addressLine1}, {c.addressLine2},<br />
            {c.city} {c.postalCode}, {c.state}, {c.country}
          </address>
          <ul className="mt-4 space-y-1 text-sm">
            {emails.map((e) => (
              <li key={e.email}><span className="inline-block w-20 text-muted/80">{e.label}</span><a href={`mailto:${e.email}`} className="text-ivory hover:text-gold">{e.email}</a></li>
            ))}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-4 text-sm">
              {socials.map((k) => (
                <li key={k}><a href={settings.social[k]} target="_blank" rel="noopener noreferrer me" className="hover:text-gold">{SOCIAL_LABELS[k]}</a></li>
              ))}
            </ul>
          )}
        </div>

        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5" aria-label="Footer">
          <div>
            <h3 className="font-display text-sm tracking-[0.15em] text-ivory">Services</h3>
            <ul className="mt-4 space-y-1 text-sm [&_a]:inline-block [&_a]:py-1.5 [&_button]:py-1.5">
              {services.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`} className="hover:text-gold">{s.title}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm tracking-[0.15em] text-ivory">Company</h3>
            <ul className="mt-4 space-y-1 text-sm [&_a]:inline-block [&_a]:py-1.5 [&_button]:py-1.5">
              {[["/about", "About"], ["/products/ns-exchange", "NS Exchange"], ["/portfolio", "Work"], ["/process", "Our Process"], ["/careers", "Careers"], ["/blog", "Insights"], ["/contact", "Contact"], ["/get-a-quote", "Start a Project"]].map(([h, l]) => (
                <li key={h}><Link href={h} className="hover:text-gold">{l}</Link></li>
              ))}
              <li><a href="https://nsexchange.com" target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-gold">nsexchange.com <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm tracking-[0.15em] text-ivory">Legal</h3>
            <ul className="mt-4 space-y-1 text-sm [&_a]:inline-block [&_a]:py-1.5 [&_button]:py-1.5">
              <li><Link href="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-gold">Terms &amp; Conditions</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-gold">Cookie Policy</Link></li>
              <li><Link href="/refund-and-cancellation-policy" className="hover:text-gold">Refund &amp; Cancellation</Link></li>
              <li><Link href="/privacy-policy#grievance-officer" className="hover:text-gold">Grievance Officer</Link></li>
              <li><CookieSettingsLink className="text-left hover:text-gold" /></li>
            </ul>
          </div>
        </nav>

        <div className="lg:col-span-3">
          <h3 className="font-display text-sm tracking-[0.15em] text-ivory">Insights in your inbox</h3>
          <p className="mt-3 text-sm leading-6">Practical notes on secure software, blockchain and fintech. One email a month, at most.</p>
          <div className="mt-5"><NewsletterForm /></div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="container-x flex flex-col gap-3 py-6 text-xs leading-5 lg:flex-row lg:items-center lg:justify-between">
          <p>© {year} {c.legalName}. All rights reserved.</p>
          <dl className="flex flex-wrap gap-x-5 gap-y-1">
            <div className="flex gap-1"><dt>CIN</dt><dd className="font-medium text-ivory/80">{c.cin}</dd></div>
            <div className="flex gap-1"><dt>GSTIN</dt><dd className="font-medium text-ivory/80">{c.gstin}</dd></div>
            <div className="flex gap-1"><dt>Udyam</dt><dd className="font-medium text-ivory/80">{c.udyam}</dd></div>
          </dl>
        </div>
      </div>
    </footer>
  );
}
