import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { LEGACY_SERVICE_REDIRECTS } from "@/lib/constants";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ModelView } from "@/components/three/ModelView";
import { getService, getServices, type FaqItem, type ProcessStep } from "@/lib/content";
import { serviceModel } from "@/lib/service-models";
import { getSettings } from "@/lib/settings";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const s = await getService((await params).slug);
  if (!s) return {};
  return buildMetadata(`/services/${s.slug}`, { title: `${s.title} Services in Kolkata, India`, description: s.shortDescription }, s);
}

export default async function ServiceDetail({ params }: Props) {
  const { slug } = await params;
  const [s, all, settings] = await Promise.all([getService(slug), getServices(), getSettings()]);
  if (!s) {
    if (LEGACY_SERVICE_REDIRECTS[slug]) permanentRedirect(`/services/${LEGACY_SERVICE_REDIRECTS[slug]}`);
    notFound();
  }
  const steps = (s.process as ProcessStep[]) || [];
  const faqs = (s.faqs as FaqItem[]) || [];
  const others = all.filter((o) => o.slug !== s.slug).slice(0, 3);
  const m = serviceModel(s.icon, settings);

  return (
    <>
      <PageHero
        eyebrow="Service"
        title={s.title}
        intro={s.shortDescription}
        crumbs={[{ href: "/services", label: "Services" }, { href: `/services/${s.slug}`, label: s.title }]}
        aside={<ModelView model={m.model} url={m.url} alt={m.alt} className="h-72 sm:h-96 lg:h-[30rem]" />}
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href={`/get-a-quote?service=${s.slug}`} className="btn-gold">Start a Project</Link>
          <Link href={`/contact?service=${s.slug}`} className="btn-ghost-light">Talk to an engineer</Link>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="overview">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 id="overview" className="h-section text-fg">Overview</h2>
            <div className="prose-site mt-6" dangerouslySetInnerHTML={{ __html: s.overview }} />
          </div>
          <aside className="lg:col-span-1">
            <div className="card sticky top-28">
              <h2 className="font-display text-lg tracking-[0.06em] text-ivory">Technology stack</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {s.techStack.map((t) => <li key={t} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-ivory/85">{t}</li>)}
              </ul>
              <hr className="my-6 border-line" />
              <p className="text-sm leading-6 text-muted">Every quote is itemised with milestones and GST shown separately. No work starts until you approve the scope in writing.</p>
              <Link href={`/get-a-quote?service=${s.slug}`} className="btn-navy mt-5 w-full">Request a quote</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section bg-surface" aria-labelledby="deliver">
        <div className="container-x">
          <SectionHeading id="deliver" eyebrow="Scope" title="What we deliver" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.deliverables.map((d) => (
              <li key={d} data-reveal className="card flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-gold" aria-hidden />
                <span className="font-medium text-fg">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {steps.length > 0 && (
        <section className="section" aria-labelledby="process">
          <div className="container-x">
            <SectionHeading id="process" eyebrow="Process" title={`How a ${s.title.toLowerCase()} engagement runs`} />
            <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((p, i) => (
                <li key={p.title} data-reveal className="card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 font-display text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 font-display text-lg tracking-[0.06em] text-ivory">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{p.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section bg-surface" aria-labelledby="faq">
          <div className="container-x max-w-4xl">
            <SectionHeading id="faq" eyebrow="FAQ" title="Frequently asked questions" />
            <div className="mt-10"><FaqList items={faqs} /></div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="related">
        <div className="container-x">
          <h2 id="related" className="h-section text-ivory">Related services</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/services/${o.slug}`} className="card group flex h-full flex-col hover:border-gold/40">
                  <span className="font-display text-lg tracking-[0.04em] text-ivory">{o.title}</span>
                  <span className="mt-1 flex-1 text-sm text-muted">{o.shortDescription}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-link">View {o.title} <ArrowRight className="h-4 w-4" aria-hidden /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBanner title={`Ready to discuss your ${s.title.toLowerCase()} project?`} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.title,
          description: s.shortDescription,
          serviceType: s.title,
          url: `${env.appUrl}/services/${s.slug}`,
          provider: { "@id": `${env.appUrl}/#organization` },
          areaServed: ["IN", "Worldwide"],
        }}
      />
    </>
  );
}
