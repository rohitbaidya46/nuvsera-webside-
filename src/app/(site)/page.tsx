import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight, BadgeCheck, Clock, Eye, FileCheck2, Headphones, Lock, MapPin, ReceiptIndianRupee, ShieldCheck, Users,
} from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { ServiceIcon } from "@/components/site/icons";
import { SectionHeading } from "@/components/site/SectionHeading";
import { HeroRotator } from "@/components/site/home/HeroRotator";
import { HeroVisual } from "@/components/site/home/HeroVisual";
import { TechLogos } from "@/components/site/home/TechLogos";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { getPage, getServices, getTestimonials } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return buildMetadata(
    "/",
    {
      title: "Nuvsera Technology — Custom Software, Blockchain & Cybersecurity | Kolkata",
      description:
        "Custom software, web and mobile apps, blockchain and crypto exchange platforms, AI integration, cybersecurity audits and analytics — engineered in Kolkata by Nuvsera Technology.",
    },
    page,
    { title: { absolute: page?.seoTitle || "Nuvsera Technology — Custom Software, Blockchain & Cybersecurity | Kolkata" } },
  );
}

const TRUST = [
  { icon: BadgeCheck, label: "MSME (Udyam) Registered" },
  { icon: FileCheck2, label: "GST Registered" },
  { icon: MapPin, label: "Kolkata, India" },
  { icon: Lock, label: "Secure by Design" },
];

const WHY = [
  { icon: Users, title: "Senior, hands-on team", text: "The engineers who scope your project are the ones who build it. No hand-offs to anonymous sub-contractors." },
  { icon: ReceiptIndianRupee, title: "Transparent pricing", text: "Itemised, milestone-based quotes in INR or USD with GST shown separately. You always know what you are paying for." },
  { icon: Clock, title: "On-time delivery", text: "Two-week sprints, a live project board and a demo at the end of every sprint keep timelines honest and visible." },
  { icon: ShieldCheck, title: "Security first", text: "Threat modelling, code review and dependency scanning are part of every build — not an optional extra at the end." },
  { icon: Headphones, title: "Post-launch support", text: "Warranty period on every release, plus monthly support plans covering monitoring, patches and improvements." },
  { icon: Eye, title: "You own everything", text: "Source code, designs, documentation and cloud accounts are transferred to you in full on final payment." },
];

export default async function HomePage() {
  const [settings, services, testimonials] = await Promise.all([getSettings(), getServices(), getTestimonials()]);
  const headlines = [settings.hero.headline, ...settings.hero.rotating].filter(Boolean);
  const stats = settings.stats.filter((s) => s.value.trim() && s.label.trim());

  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-navy">
        <div className="bg-grid absolute inset-0" aria-hidden />
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand/30 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-gold/15 blur-3xl" aria-hidden />
        <div className="container-x relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Software · Blockchain · Cybersecurity
            </p>
            <div className="mt-6">
              <HeroRotator headlines={headlines} />
            </div>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300 text-pretty">{settings.hero.subheadline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/get-a-quote" className="btn-gold px-6 text-base">Get a Free Quote <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <Link href="/services" className="btn-ghost-light px-6 text-base">Explore Services</Link>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* 2. Trust bar */}
      <section aria-label="Company credentials" className="border-b border-line bg-surface">
        <ul className="container-x grid grid-cols-2 gap-4 py-6 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center justify-center gap-2.5 text-sm font-semibold text-fg lg:justify-start">
              <Icon className="h-5 w-5 shrink-0 text-brand-700 dark:text-gold" aria-hidden /> {label}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Services */}
      <section className="section" aria-labelledby="services-heading">
        <div className="container-x">
          <SectionHeading id="services-heading" eyebrow="What we do" title="Engineering services for every stage of your digital journey" intro="From a first prototype to a regulated, high-traffic platform — one accountable team for design, development, security and data." />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, n) => (
              <li key={s.slug} data-reveal style={{ ["--reveal-delay" as string]: `${(n % 4) * 60}ms` }}>
                <Link href={`/services/${s.slug}`} className="card group flex h-full flex-col hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold transition group-hover:bg-brand-700 group-hover:text-white">
                    <ServiceIcon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-fg">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{s.shortDescription}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-link">
                    Explore {s.title} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Featured product */}
      <section className="section bg-surface" aria-labelledby="product-heading">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div data-reveal="left">
            <p className="eyebrow">Featured product</p>
            <h2 id="product-heading" className="h-section mt-3 text-fg">NS Exchange — our own crypto exchange platform</h2>
            <p className="lead mt-4">
              NS Exchange is the digital-asset exchange built and operated by our group. The same engineering that powers it — matching
              engine, custody-aware wallets, KYC/AML workflows and a full operator console — is available to businesses that want to
              launch their own exchange.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Spot and P2P trading", "Hot / cold wallet architecture", "KYC/AML-ready onboarding", "Operator admin & reporting"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-medium text-fg"><BadgeCheck className="h-5 w-5 text-brand-700 dark:text-gold" aria-hidden /> {f}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products/ns-exchange" className="btn-navy">Learn more about NS Exchange <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <Link href="/services/crypto-exchange-development" className="btn-outline">Build your own exchange</Link>
            </div>
          </div>
          <div data-reveal aria-hidden="true" className="rounded-2xl border border-line bg-card p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-fg">NS Exchange</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Illustrative UI</span>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-4">
              <div className="col-span-3 rounded-xl bg-surface p-3">
                <svg viewBox="0 0 200 90" className="h-32 w-full">
                  <polyline fill="none" stroke="#3D6BFF" strokeWidth="2.5" points="0,70 20,62 40,66 60,48 80,52 100,36 120,42 140,28 160,32 180,18 200,22" />
                  <polyline fill="none" stroke="#E3A93B" strokeWidth="1.5" strokeDasharray="4 4" points="0,75 40,70 80,60 120,50 160,40 200,30" />
                </svg>
              </div>
              <div className="col-span-2 space-y-1.5 rounded-xl bg-surface p-3 text-[10px]">
                {[0, 1, 2, 3].map((n) => <div key={`a${n}`} className="h-3 rounded bg-red-500/20" style={{ width: `${90 - n * 15}%` }} />)}
                <div className="py-1" />
                {[0, 1, 2, 3].map((n) => <div key={`b${n}`} className="h-3 rounded bg-emerald-500/25" style={{ width: `${45 + n * 15}%` }} />)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-10 rounded-lg bg-emerald-600/90" />
              <div className="h-10 rounded-lg bg-red-500/80" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why choose us */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container-x">
          <SectionHeading id="why-heading" eyebrow="Why Nuvsera" title="A partner you can hold accountable" intro="We are a young company, so we earn trust the only way that works: clear commitments, visible progress and work that holds up under scrutiny." />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map(({ icon: Icon, title, text }, n) => (
              <li key={title} data-reveal style={{ ["--reveal-delay" as string]: `${(n % 3) * 60}ms` }} className="card">
                <Icon className="h-7 w-7 text-brand-700 dark:text-gold" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-fg">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Process */}
      <section className="section bg-surface" aria-labelledby="process-heading">
        <div className="container-x">
          <SectionHeading id="process-heading" eyebrow="How we work" title="A clear, six-step delivery process" intro="Every engagement follows the same disciplined path, so you always know what happens next." center />
          <div className="mt-14"><ProcessTimeline /></div>
          <p className="mt-10 text-center"><Link href="/process" className="link">See our process in detail →</Link></p>
        </div>
      </section>

      {/* 7. Technology stack */}
      <section className="section" aria-labelledby="tech-heading">
        <div className="container-x">
          <SectionHeading id="tech-heading" eyebrow="Technology" title="Proven, well-supported technology" intro="We choose mainstream tools with long-term support, large talent pools and strong security track records — so your product is never locked to us." center />
          <div className="mt-12"><TechLogos /></div>
          <p className="mt-6 text-center text-xs text-muted">Product names and logos are trademarks of their respective owners and are shown only to indicate technologies we work with.</p>
        </div>
      </section>

      {/* 8. Stats — rendered only when real figures have been entered in the admin panel */}
      {stats.length > 0 && (
        <section className="bg-navy py-14" aria-label="Company figures">
          <dl className="container-x grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} data-reveal className="flex flex-col-reverse">
                <dt className="mt-2 text-sm text-slate-300">{s.label}</dt>
                <dd className="text-4xl font-bold tracking-tight text-gold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* 9. Testimonials — only real, approved testimonials with permission on file */}
      {testimonials.length > 0 && (
        <section className="section bg-surface" aria-labelledby="testimonials-heading">
          <div className="container-x">
            <SectionHeading id="testimonials-heading" eyebrow="Client feedback" title="What our clients say" center />
            <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.id} data-reveal>
                  <figure className="card h-full">
                    {t.rating ? <p className="text-gold" aria-label={`Rated ${t.rating} out of 5`}>{"★".repeat(t.rating)}<span className="text-line">{"★".repeat(5 - t.rating)}</span></p> : null}
                    <blockquote className="mt-3 leading-7 text-fg">“{t.quote}”</blockquote>
                    <figcaption className="mt-5 text-sm">
                      <span className="block font-semibold text-fg">{t.name}</span>
                      <span className="text-muted">{[t.designation, t.company].filter(Boolean).join(", ")}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 10. CTA banner */}
      <CtaBanner />
    </>
  );
}
