import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, BadgeCheck, FileCheck2, Landmark, ReceiptIndianRupee, ShieldCheck } from "lucide-react";
import {
  siDocker, siEthereum, siFlutter, siGo, siKubernetes, siNextdotjs, siNodedotjs, siPostgresql, siPython, siReact, siRedis, siSolidity, siTypescript, siApachekafka,
} from "simple-icons";
import { Magnetic } from "@/components/experience/Magnetic";
import { GoldRule, SplitText } from "@/components/experience/SplitText";
import { TiltCard } from "@/components/experience/TiltCard";
import { CtaBanner } from "@/components/site/CtaBanner";
import { SectionHeading } from "@/components/site/SectionHeading";
import { HeroVisual } from "@/components/site/home/HeroVisual";
import { PinnedScene } from "@/components/site/home/PinnedScene";
import { ProcessScroller } from "@/components/site/home/ProcessScroller";
import { PROCESS_STEPS } from "@/components/site/ProcessTimeline";
import { ModelView } from "@/components/three/ModelView";
import type { ModelKey } from "@/components/three/Scene";
import { getPage, getServices, getTestimonials } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const TITLE = "Nuvsera Technology — Technology for secure digital finance | Kolkata";
const DESCRIPTION =
  "Custom software, blockchain and crypto exchange development, smart contracts, cybersecurity and fintech platforms — engineered in Kolkata by Nuvsera Technology, builders of NS Exchange.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return buildMetadata("/", { title: TITLE, description: DESCRIPTION }, page, { title: { absolute: page?.seoTitle || TITLE } });
}

/** The three flagship practices shown as large 3D cards. Titles/descriptions come from Admin → Services. */
const FEATURED: { slug: string; model: ModelKey; settingsKey: "software" | "blockchain" | "security"; alt: string }[] = [
  { slug: "custom-software-development", model: "software", settingsKey: "software", alt: "3D illustration: a dark laptop and phone surrounded by floating gold interface panels" },
  { slug: "blockchain-crypto-exchange-development", model: "blockchain", settingsKey: "blockchain", alt: "3D illustration: translucent glass blocks linked by gold chains" },
  { slug: "cybersecurity", model: "security", settingsKey: "security", alt: "3D illustration: a gold and steel shield engraved with circuit lines around a glowing blue core" },
];

const WHY = [
  { icon: ShieldCheck, title: "Security-first", text: "Threat modelling, code review, dependency scanning and penetration testing are part of every build, not an optional extra at the end." },
  { icon: FileCheck2, title: "Compliance-ready", text: "We design for audit trails, data localisation and record-keeping, and we are FIU-IND and CERT-In aware, working alongside your compliance advisers." },
  { icon: Landmark, title: "Indian registered company", text: "A private limited company incorporated in West Bengal, GST registered and Udyam (MSME) registered, with an office on Park Street, Kolkata." },
  { icon: ReceiptIndianRupee, title: "Transparent pricing", text: "Itemised, milestone-based quotes in INR or USD with GST shown separately. Source code and IP transfer to you on final payment." },
];

const ORBIT = [
  ["React", siReact], ["Next.js", siNextdotjs], ["TypeScript", siTypescript], ["Node.js", siNodedotjs], ["Go", siGo], ["Python", siPython], ["Flutter", siFlutter],
  ["Solidity", siSolidity], ["Ethereum", siEthereum], ["PostgreSQL", siPostgresql], ["Redis", siRedis], ["Kafka", siApachekafka], ["Docker", siDocker], ["Kubernetes", siKubernetes],
] as const;

export default async function HomePage() {
  const [settings, services, testimonials] = await Promise.all([getSettings(), getServices(), getTestimonials()]);
  const c = settings.company;
  const stats = settings.stats.filter((s) => s.value.trim() && s.label.trim());
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  const featured = FEATURED.map((f) => ({ ...f, service: bySlug.get(f.slug) })).filter((f) => f.service);
  const others = services.filter((s) => !FEATURED.some((f) => f.slug === s.slug));
  const words = settings.hero.headline.split(/\s+/).length;

  return (
    <>
      {/* 1. Hero */}
      <section className="relative -mt-[72px] flex min-h-[100svh] items-end overflow-hidden pt-[72px] lg:-mt-20 lg:items-center lg:pt-20" aria-labelledby="hero-heading">
        <HeroVisual modelUrl={settings.models.hero || undefined} cinematic />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent lg:bg-gradient-to-r lg:from-navy lg:via-navy/60 lg:to-transparent" aria-hidden />
        <div className="noise pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-x relative z-10 pb-24 pt-[46vh] lg:py-32">
          <div className="max-w-3xl">
            <p data-reveal className="eyebrow">Custom Software · Blockchain · Cybersecurity</p>
            <SplitText as="h1" id="hero-heading" text={settings.hero.headline} accentFrom={words > 3 ? words - 3 : undefined} className="h-display mt-6 text-ivory lg:text-[6rem]" delay={150} />
            <p data-reveal style={{ ["--reveal-delay" as string]: "450ms" }} className="mt-7 max-w-xl text-lg leading-8 text-muted text-pretty sm:text-xl">
              {settings.hero.subheadline}
            </p>
            <div data-reveal style={{ ["--reveal-delay" as string]: "600ms" }} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Magnetic><Link href="/get-a-quote" className="btn-gold px-8 py-3.5 text-[15px]">Start a Project <ArrowRight className="h-4 w-4" aria-hidden /></Link></Magnetic>
              <Magnetic><Link href="/services" className="btn-ghost-light px-8 py-3.5 text-[15px]">View Services</Link></Magnetic>
            </div>
          </div>
          <ul data-reveal style={{ ["--reveal-delay" as string]: "750ms" }} className="mt-16 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted" aria-label="Company credentials">
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-gold" aria-hidden /> Private Limited · CIN {c.cin}</li>
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-gold" aria-hidden /> GST &amp; MSME registered</li>
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-gold" aria-hidden /> Park Street, Kolkata</li>
          </ul>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-muted lg:flex" aria-hidden>
          Scroll
          <span className="relative h-12 w-px overflow-hidden bg-white/10"><span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-gold" /></span>
        </div>
      </section>

      {/* 2. Services: large interactive 3D cards */}
      <section className="section relative" aria-labelledby="services-heading">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading id="services-heading" eyebrow="What we do" title="Three disciplines. One accountable team." intro="Every product we ship is designed, built and secured by the same senior engineers, from first workshop to long-term support." />
            <Link href="/services" className="link shrink-0 text-sm uppercase tracking-[0.2em]" data-cursor="All">All services →</Link>
          </div>
          <ul className="mt-16 grid gap-6 lg:grid-cols-3">
            {featured.map(({ slug, model, settingsKey, alt, service }, n) => (
              <li key={slug} data-reveal style={{ ["--reveal-delay" as string]: `${n * 120}ms` }}>
                <TiltCard className="h-full rounded-[1.75rem]">
                  <Link href={`/services/${slug}`} data-cursor="View" className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.01] transition duration-500 hover:border-gold/40">
                    <div className="relative">
                      <div className="absolute inset-x-10 top-10 h-40 rounded-full bg-gold/10 blur-3xl transition duration-700 group-hover:bg-gold/20" aria-hidden />
                      <ModelView model={model} url={settings.models[settingsKey] || undefined} alt={alt} className="h-72 sm:h-80" eager />
                    </div>
                    <div className="flex flex-1 flex-col p-8 pt-2">
                      <p className="font-display text-sm tracking-[0.2em] text-gold">0{n + 1}</p>
                      <h3 className="mt-3 font-display text-2xl tracking-[0.04em] text-ivory">{service!.title}</h3>
                      <p className="mt-3 flex-1 leading-7 text-muted">{service!.shortDescription}</p>
                      <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gold">
                        Explore <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </TiltCard>
              </li>
            ))}
          </ul>
          {others.length > 0 && (
            <ul data-reveal className="mt-6 grid gap-4 sm:grid-cols-2">
              {others.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="group flex items-center justify-between gap-6 rounded-2xl border border-white/[0.07] px-6 py-5 transition hover:border-gold/40 hover:bg-white/[0.02]">
                    <span><span className="block font-display text-lg tracking-[0.04em] text-ivory">{s.title}</span><span className="mt-1 block text-sm text-muted line-clamp-1">{s.shortDescription}</span></span>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <GoldRule />

      {/* 3. Featured product: NS Exchange (pinned; the coin scene turns as you scroll) */}
      <section aria-labelledby="product-heading">
        <PinnedScene scrollKey="exchange" length={0.9} className="flex min-h-screen items-center">
          <div className="container-x grid w-full items-center gap-10 py-20 lg:grid-cols-2">
            <div>
              <p data-reveal className="eyebrow">Featured product</p>
              <SplitText id="product-heading" text="NS Exchange. Built and owned by Nuvsera." className="h-section mt-5 text-ivory" />
              <p data-reveal className="lead mt-6 max-w-xl">
                NS Exchange is the crypto exchange we built and run ourselves: a matching engine, custody-aware wallets, KYC/AML-ready onboarding and a full operator console.
                Operating a real platform keeps our standards high, and the same engineering is available to businesses launching their own exchange.
              </p>
              <ul data-reveal className="mt-8 grid gap-3 sm:grid-cols-2">
                {["Spot and P2P trading", "Hot / cold wallet architecture", "KYC/AML-ready onboarding", "Operator console & reporting"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-ivory"><span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden /> {f}</li>
                ))}
              </ul>
              <div data-reveal className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Magnetic><a href="https://nsexchange.com" target="_blank" rel="noopener" className="btn-gold">Visit nsexchange.com <ArrowUpRight className="h-4 w-4" aria-hidden /></a></Magnetic>
                <Magnetic><Link href="/services/blockchain-crypto-exchange-development" className="btn-ghost-light">Build your own exchange</Link></Magnetic>
              </div>
            </div>
            <ModelView
              model="exchange"
              scrollKey="exchange"
              url={settings.models.exchange || undefined}
              alt="3D illustration: gold coin stacks in front of a blue candlestick-chart hologram"
              className="h-[24rem] sm:h-[32rem] lg:h-[40rem]"
            />
          </div>
        </PinnedScene>
      </section>

      <GoldRule />

      {/* 4. Process: horizontal scroll timeline */}
      <section aria-labelledby="process-heading">
        <ProcessScroller
          steps={PROCESS_STEPS.map(({ title, text }) => ({ title, text }))}
          heading={<SectionHeading id="process-heading" eyebrow="How we work" title="Discover. Design. Build. Secure. Launch." intro="Every engagement follows the same disciplined path, so you always know what happens next and what you receive at each step." />}
        />
      </section>

      <GoldRule />

      {/* 5. Technology orbit */}
      <section className="section overflow-hidden" aria-labelledby="tech-heading">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="tech-heading" eyebrow="Technology" title="Proven tools, chosen for the long run." intro="Mainstream technology with long-term support, large talent pools and strong security records, so your product is never locked to us." />
            <ul data-reveal className="mt-10 flex flex-wrap gap-2" aria-label="Technologies we use">
              {ORBIT.map(([name]) => (
                <li key={name} className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs tracking-wide text-ivory/80">{name}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted/80">Product names and logos are trademarks of their respective owners, shown only to indicate technologies we work with.</p>
          </div>
          <ModelView
            model="orbit"
            z={9}
            icons={ORBIT.map(([name, icon]) => ({ name, path: icon.path }))}
            alt="Technology logos orbiting the Nuvsera crest"
            className="h-[24rem] sm:h-[30rem]"
          />
        </div>
      </section>

      {/* 6. Why Nuvsera */}
      <section className="section relative" aria-labelledby="why-heading">
        <div className="bg-vignette absolute inset-0" aria-hidden />
        <div className="container-x relative">
          <SectionHeading id="why-heading" eyebrow="Why Nuvsera" title="Private-bank discipline, deep-tech engineering." center />
          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({ icon: Icon, title, text }, n) => (
              <li key={title} data-reveal style={{ ["--reveal-delay" as string]: `${n * 100}ms` }}>
                <TiltCard className="h-full rounded-2xl">
                  <div className="card h-full p-8">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold"><Icon className="h-5 w-5" aria-hidden /></span>
                    <h3 className="mt-6 font-display text-xl tracking-[0.04em] text-ivory">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{text}</p>
                  </div>
                </TiltCard>
              </li>
            ))}
          </ul>
          <dl data-reveal className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-x-10 gap-y-3 text-center text-xs uppercase tracking-[0.2em] text-muted">
            <div><dt className="inline">CIN </dt><dd className="inline text-ivory">{c.cin}</dd></div>
            <div><dt className="inline">GSTIN </dt><dd className="inline text-ivory">{c.gstin}</dd></div>
            <div><dt className="inline">Udyam </dt><dd className="inline text-ivory">{c.udyam}</dd></div>
          </dl>
        </div>
      </section>

      {/* Figures — rendered only when real numbers have been entered in Admin → Site settings */}
      {stats.length > 0 && (
        <section className="border-y border-gold/15 py-16" aria-label="Company figures">
          <dl className="container-x grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} data-reveal className="flex flex-col-reverse">
                <dt className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">{s.label}</dt>
                <dd className="font-serif text-5xl text-gold-gradient">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Testimonials — only real, approved testimonials with permission on file */}
      {testimonials.length > 0 && (
        <section className="section" aria-labelledby="testimonials-heading">
          <div className="container-x">
            <SectionHeading id="testimonials-heading" eyebrow="Client feedback" title="What our clients say" center />
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.id} data-reveal>
                  <figure className="card h-full p-8">
                    <blockquote className="font-serif text-xl leading-8 text-ivory">“{t.quote}”</blockquote>
                    <figcaption className="mt-6 text-sm">
                      <span className="block font-semibold text-ivory">{t.name}</span>
                      <span className="text-muted">{[t.designation, t.company].filter(Boolean).join(", ")}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 7. Contact CTA band */}
      <CtaBanner />
    </>
  );
}
