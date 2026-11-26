import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { MapEmbed } from "@/components/site/MapEmbed";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/site/forms/ContactForm";
import { getPage, getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return buildMetadata("/contact", {
    title: "Contact Us — Nuvsera Technology, Park Street, Kolkata",
    description: "Contact Nuvsera Technology: 706, OM Tower, 32 Chowringhee Road, Park Street, Kolkata 700071. Call or WhatsApp +91 97343 33355.",
  }, await getPage("contact"));
}

type Props = { searchParams: Promise<{ service?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const [page, services, settings, sp] = await Promise.all([getPage("contact"), getServices(), getSettings(), searchParams]);
  const c = settings.company;
  const items = [
    { icon: Phone, label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: `${c.phone} · chat with us`, href: `https://wa.me/${c.whatsapp}?text=${encodeURIComponent("Hello Nuvsera Technology, I would like to discuss a project.")}`, external: true },
    { icon: Mail, label: "General enquiries", value: c.email, href: `mailto:${c.email}` },
    ...(c.projectsEmail ? [{ icon: Mail, label: "Projects & technical", value: c.projectsEmail, href: `mailto:${c.projectsEmail}` }] : []),
    ...(c.supportEmail ? [{ icon: Mail, label: "Support", value: c.supportEmail, href: `mailto:${c.supportEmail}` }] : []),
    { icon: MapPin, label: "Office", value: `${c.addressLine1}, ${c.addressLine2}, ${c.city} – ${c.postalCode}, ${c.state}, ${c.country}`, href: c.mapUrl, external: true },
    { icon: Clock, label: "Hours", value: c.businessHours },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title={page?.title || "Let’s talk about your project"} intro={page?.intro || "Tell us what you are planning. A senior engineer will review your enquiry and reply within one business day."} crumbs={[{ href: "/contact", label: "Contact Us" }]} />
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="card sm:p-8">
              <h2 className="font-display text-2xl tracking-[0.05em] text-ivory">Send us an enquiry</h2>
              <div className="mt-6"><ContactForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} defaultService={services.some((s) => s.slug === sp.service) ? sp.service : undefined} /></div>
            </div>
          </div>
          <aside className="space-y-4 lg:col-span-2">
            {items.map(({ icon: Icon, label, value, href, external }) => {
              const content = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold"><Icon className="h-5 w-5" aria-hidden /></span>
                  <span><span className="block text-sm text-muted">{label}</span><span className="block font-medium text-ivory [overflow-wrap:anywhere]">{value}</span></span>
                </>
              );
              return href ? (
                <a key={label} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="card flex items-start gap-4 hover:border-gold/40">{content}</a>
              ) : (
                <div key={label} className="card flex items-start gap-4">{content}</div>
              );
            })}
            <div className="card text-sm text-muted">
              <p className="font-semibold text-ivory">{c.legalName}</p>
              <p className="mt-1">CIN {c.cin} · GSTIN {c.gstin} · Udyam {c.udyam}</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="pb-24" aria-label="Office location">
        <div className="container-x">
          <MapEmbed mapUrl={c.mapUrl} className="h-80 sm:h-[28rem]" />
        </div>
      </section>
    </>
  );
}
