import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { ServiceIcon } from "@/components/site/icons";
import { PageHero } from "@/components/site/PageHero";
import { getPage, getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata("/services", {
    title: "Services — Software, Web, Mobile, Blockchain, AI & Security",
    description: "Explore Nuvsera Technology’s eight engineering services: software, web and mobile development, blockchain, crypto exchange platforms, AI integration, cybersecurity audits and data analytics.",
  }, await getPage("services"));
}

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getPage("services"), getServices()]);
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={page?.title || "Engineering services built around your business"}
        intro={page?.intro || "Eight specialist practices, one delivery standard. Pick a single service or combine them — we bring the same senior team, security discipline and transparent pricing to every engagement."}
        crumbs={[{ href: "/services", label: "Services" }]}
      />
      <section className="section">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <article key={s.slug} data-reveal className="card flex flex-col sm:flex-row sm:gap-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
                <ServiceIcon name={s.icon} className="h-7 w-7" />
              </span>
              <div className="mt-4 flex flex-1 flex-col sm:mt-0">
                <h2 className="text-xl font-semibold text-fg">{s.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{s.shortDescription}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.deliverables.slice(0, 4).map((d) => (
                    <li key={d} className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-fg">{d}</li>
                  ))}
                </ul>
                <Link href={`/services/${s.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-link">
                  Explore {s.title} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CtaBanner title="Not sure which service you need?" text="Describe the problem you are trying to solve. We will recommend the right approach — even if that means a smaller engagement than you expected." />
    </>
  );
}
