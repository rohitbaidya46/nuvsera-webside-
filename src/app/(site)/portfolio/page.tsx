import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { PageHero } from "@/components/site/PageHero";
import { getCaseStudies, getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata("/portfolio", {
    title: "Portfolio & Case Studies",
    description: "Selected projects and case studies from Nuvsera Technology across software, blockchain, mobile, AI and cybersecurity.",
  }, await getPage("portfolio"));
}

export default async function PortfolioPage() {
  const [page, items] = await Promise.all([getPage("portfolio"), getCaseStudies()]);
  return (
    <>
      <PageHero eyebrow="Portfolio" title={page?.title || "Our work"} intro={page?.intro || "Case studies describing the problems we solved, how we approached them and what changed for the client."} crumbs={[{ href: "/portfolio", label: "Portfolio" }]} />
      <section className="section">
        <div className="container-x">
          {items.length === 0 ? (
            <div className="card mx-auto max-w-2xl text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-muted" aria-hidden />
              <h2 className="mt-4 text-xl font-semibold text-fg">Case studies are on their way</h2>
              <p className="mt-2 text-muted">We publish case studies only with our clients’ written permission. In the meantime, we are happy to walk you through relevant work on a call, under NDA if required.</p>
              <Link href="/contact" className="btn-navy mt-6">Request a walkthrough</Link>
            </div>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <li key={c.id} data-reveal>
                  <Link href={`/portfolio/${c.slug}`} className="card group flex h-full flex-col overflow-hidden p-0 hover:border-brand/40 hover:shadow-md">
                    {c.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.coverImage} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" width={640} height={360} />
                    ) : (
                      <div className="flex aspect-[16/9] items-center justify-center bg-navy text-sm text-slate-400">[Placeholder cover image]</div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {c.isPlaceholder && <span className="mb-2 w-fit rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Placeholder</span>}
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{c.industry}</p>
                      <h2 className="mt-1 text-lg font-semibold text-fg">{c.title}</h2>
                      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{c.summary}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-link">Read case study <ArrowRight className="h-4 w-4" aria-hidden /></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
