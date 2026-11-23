import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBanner } from "@/components/site/CtaBanner";
import { PageHero } from "@/components/site/PageHero";
import { getCaseStudy } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const c = await getCaseStudy((await params).slug);
  if (!c) return {};
  return buildMetadata(`/portfolio/${c.slug}`, { title: `${c.title} — Case Study`, description: c.summary }, c);
}

export default async function CaseStudyPage({ params }: Props) {
  const c = await getCaseStudy((await params).slug);
  if (!c) notFound();
  const sections = [["The challenge", c.challenge], ["Our solution", c.solution], ["The results", c.results]].filter(([, v]) => v) as [string, string][];
  return (
    <>
      <PageHero eyebrow={c.industry || "Case study"} title={c.title} intro={c.summary} crumbs={[{ href: "/portfolio", label: "Portfolio" }, { href: `/portfolio/${c.slug}`, label: c.title }]} />
      <article className="section">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {c.isPlaceholder && <p className="rounded-lg border border-dashed border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">This is a placeholder case study. Replace it with a real, client-approved project before publishing.</p>}
            {sections.map(([h, v]) => (
              <section key={h}>
                <h2 className="text-2xl font-bold tracking-tight text-fg">{h}</h2>
                <p className="mt-3 whitespace-pre-line leading-8 text-muted">{v}</p>
              </section>
            ))}
            {c.body && <div className="prose-site" dangerouslySetInnerHTML={{ __html: c.body }} />}
          </div>
          <aside className="card h-fit bg-surface text-sm">
            <dl className="space-y-3">
              {c.client && <div><dt className="text-muted">Client</dt><dd className="font-medium text-fg">{c.client}</dd></div>}
              {c.industry && <div><dt className="text-muted">Industry</dt><dd className="font-medium text-fg">{c.industry}</dd></div>}
              {c.services.length > 0 && (
                <div>
                  <dt className="text-muted">Services</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">{c.services.map((s) => <Link key={s} href={`/services/${s}`} className="rounded bg-card px-2 py-1 font-medium text-link">{s.replace(/-/g, " ")}</Link>)}</dd>
                </div>
              )}
            </dl>
          </aside>
        </div>
      </article>
      <CtaBanner />
    </>
  );
}
