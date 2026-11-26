import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GoldRule } from "@/components/experience/SplitText";
import { TiltCard } from "@/components/experience/TiltCard";
import { CtaBanner } from "@/components/site/CtaBanner";
import { PageHero } from "@/components/site/PageHero";
import { ModelView } from "@/components/three/ModelView";
import { getPage, getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { serviceModel } from "@/lib/service-models";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return buildMetadata("/services", {
    title: "Services — Custom Software, Blockchain, Smart Contracts, Cybersecurity & Fintech",
    description: "Nuvsera Technology’s services: custom software and web/mobile apps, blockchain and crypto exchange development, smart contracts and wallets, cybersecurity (audits, VAPT, secure architecture) and fintech platforms.",
  }, await getPage("services"));
}

export default async function ServicesPage() {
  const [page, services, settings] = await Promise.all([getPage("services"), getServices(), getSettings()]);
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={page?.title || "Engineering services built around your business"}
        intro={page?.intro || "Five specialist practices, one delivery standard. Pick a single service or combine them: the same senior team, security discipline and transparent pricing on every engagement."}
        crumbs={[{ href: "/services", label: "Services" }]}
      />
      <section className="section">
        <ol className="container-x space-y-24 lg:space-y-32">
          {services.map((s, i) => {
            const m = serviceModel(s.icon, settings);
            return (
              <li key={s.slug} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={i % 2 ? "lg:order-2" : ""}>
                  <TiltCard className="rounded-[2rem]">
                    <Link href={`/services/${s.slug}`} data-cursor="View" aria-label={`${s.title}: view service`} className="block rounded-[2rem] border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent">
                      <ModelView model={m.model} url={m.url} alt={m.alt} className="h-80 sm:h-[26rem]" />
                    </Link>
                  </TiltCard>
                </div>
                <div>
                  <p data-reveal className="font-display text-sm tracking-[0.25em] text-gold">{String(i + 1).padStart(2, "0")}</p>
                  <h2 data-reveal className="h-section mt-4 text-ivory">{s.title}</h2>
                  <p data-reveal className="lead mt-5">{s.shortDescription}</p>
                  <ul data-reveal className="mt-6 space-y-2.5">
                    {s.deliverables.slice(0, 4).map((d) => (
                      <li key={d} className="flex gap-3 text-sm leading-6 text-ivory/90"><span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" aria-hidden /> {d}</li>
                    ))}
                  </ul>
                  <Link data-reveal href={`/services/${s.slug}`} className="btn-outline mt-8">
                    Explore {s.title} <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
      <GoldRule />
      <CtaBanner title="Not sure which service you need?" text="Describe the problem you are trying to solve. We will recommend the right approach, even if that means a smaller engagement than you expected." />
    </>
  );
}
