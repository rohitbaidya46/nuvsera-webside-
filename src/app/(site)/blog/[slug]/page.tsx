import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBanner } from "@/components/site/CtaBanner";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { getPost, readingTime } from "@/lib/content";
import { env } from "@/lib/env";
import { absolute, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return buildMetadata(`/blog/${p.slug}`, { title: p.title, description: p.excerpt }, { ...p, ogImage: p.ogImage || p.coverImage }, {
    openGraph: { type: "article", publishedTime: p.publishedAt?.toISOString(), title: p.seoTitle || p.title, description: p.seoDescription || p.excerpt },
  });
}

export default async function PostPage({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  return (
    <>
      <PageHero eyebrow={p.category?.name ?? "Insights"} title={p.title} intro={p.excerpt} crumbs={[{ href: "/blog", label: "Insights" }, { href: `/blog/${p.slug}`, label: p.title }]}>
        <p className="mt-6 text-sm text-slate-300">
          {p.authorName && <>By {p.authorName} · </>}
          {p.publishedAt && <time dateTime={p.publishedAt.toISOString()}>{p.publishedAt.toLocaleDateString("en-IN", { dateStyle: "long" })}</time>} · {readingTime(p.body)} min read
        </p>
      </PageHero>
      <article className="section">
        <div className="container-x max-w-3xl">
          {p.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.coverImage} alt="" className="mb-10 w-full rounded-2xl" width={1200} height={630} />
          )}
          <div className="prose-site prose-lg" dangerouslySetInnerHTML={{ __html: p.body }} />
          {p.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
              {p.tags.map((t) => <li key={t.id}><Link href={`/blog?tag=${t.slug}`} className="rounded-full bg-surface px-3 py-1.5 text-sm text-fg">#{t.name}</Link></li>)}
            </ul>
          )}
        </div>
      </article>
      <CtaBanner />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.title,
          description: p.excerpt,
          datePublished: p.publishedAt?.toISOString(),
          dateModified: p.updatedAt.toISOString(),
          image: p.coverImage ? absolute(p.coverImage) : undefined,
          author: { "@type": p.authorName ? "Person" : "Organization", name: p.authorName || "Nuvsera Technology" },
          publisher: { "@id": `${env.appUrl}/#organization` },
          mainEntityOfPage: `${env.appUrl}/blog/${p.slug}`,
        }}
      />
    </>
  );
}
