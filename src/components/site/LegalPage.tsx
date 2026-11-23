import { notFound } from "next/navigation";
import { PageHero } from "./PageHero";
import { getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function legalMetadata(slug: string, description: string) {
  const p = await getPage(slug);
  return buildMetadata(`/${slug}`, { title: p?.title || slug, description }, p);
}

export async function LegalPage({ slug }: { slug: string }) {
  const p = await getPage(slug);
  if (!p) notFound();
  return (
    <>
      <PageHero title={p.title} intro={p.intro} crumbs={[{ href: `/${slug}`, label: p.title }]} />
      <section className="section">
        <div className="container-x max-w-4xl">
          <p className="mb-8 text-sm text-muted">Last updated: {p.updatedAt.toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
          <div className="prose-site" dangerouslySetInnerHTML={{ __html: p.body || "" }} />
        </div>
      </section>
    </>
  );
}
