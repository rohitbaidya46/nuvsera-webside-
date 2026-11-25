import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { LEGACY_SERVICE_REDIRECTS } from "@/lib/constants";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getService, getServices, type FaqItem, type ProcessStep } from "@/lib/content";
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
  const [s, all] = await Promise.all([getService(slug), getServices()]);
  if (!s) {
    if (LEGACY_SERVICE_REDIRECTS[slug]) permanentRedirect(`/services/${LEGACY_SERVICE_REDIRECTS[slug]}`);
    notFound();
  }
  const steps = (s.process as ProcessStep[]) || [];
  const faqs = (s.faqs as FaqItem[]) || [];
  const others = all.filter((o) => o.slug !== s.slug).slice(0, 3);

  return (
    <>
      <PageHero eyebrow="Service" title={s.title} intro={s.shortDescription} crumbs={[{ href: "/services", label: "Services" }, { href: `/services/${s.slug}`, label: s.title }]}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/get-a-quote?service=${s.slug}`} className="btn-gold">Get a quote for {s.title.toLowerCase()}</Link>
          <Link href="/contact" className="btn-ghost-light">Talk to an engineer</Link>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="overview">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 id="overview" className="h-section text-fg">Overview</h2>
            <div className="prose-site mt-6" dangerouslySetInnerHTML={{ __html: s.overview }} />
          </div>
          <aside className="lg:col-span-1">
            <div className="card sticky top-24 bg-surface">
              <h2 className="text-lg font-semibold text-fg">Technology stack</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {s.techStack.map((t) => <li key={t} className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-fg">{t}</li>)}
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
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy">{i + 1}</span>
                  <h3 className="mt-4 text-lg font-semibold text-fg">{p.title}</h3>
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
          <h2 id="related" className="text-2xl font-bold tracking-tight text-fg">Related services</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/services/${o.slug}`} className="card group flex h-full flex-col hover:border-brand/40">
                  <span className="font-semibold text-fg">{o.title}</span>
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
