import Link from "next/link";
import { CtaBanner } from "@/components/site/CtaBanner";
import { PageHero } from "@/components/site/PageHero";
import { countPosts, getCategories, getPage, getPosts, readingTime } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const PER_PAGE = 9;
type Props = { searchParams: Promise<{ category?: string; tag?: string; page?: string }> };

export async function generateMetadata({ searchParams }: Props) {
  const sp = await searchParams;
  const filtered = sp.category || sp.tag || sp.page;
  return buildMetadata("/blog", {
    title: "Insights — Software, Blockchain & Security Articles",
    description: "Practical articles from the Nuvsera Technology team on software engineering, blockchain, crypto exchanges, AI and cybersecurity.",
  }, await getPage("blog"), filtered ? { robots: { index: false, follow: true } } : {});
}

export default async function BlogIndex({ searchParams }: Props) {
  const sp = await searchParams;
  const pageNo = Math.max(1, Number(sp.page) || 1);
  const [page, posts, total, categories] = await Promise.all([
    getPage("blog"),
    getPosts({ category: sp.category, tag: sp.tag, take: PER_PAGE, skip: (pageNo - 1) * PER_PAGE }),
    countPosts(sp.category, sp.tag),
    getCategories(),
  ]);
  const pages = Math.ceil(total / PER_PAGE);
  const qs = (n: number) => `/blog?${new URLSearchParams({ ...(sp.category ? { category: sp.category } : {}), ...(sp.tag ? { tag: sp.tag } : {}), page: String(n) })}`;
  return (
    <>
      <PageHero eyebrow="Insights" title={page?.title || "Insights from our engineers"} intro={page?.intro || "Notes from the work: architecture decisions, security lessons and practical guides."} crumbs={[{ href: "/blog", label: "Insights" }]} />
      <section className="section">
        <div className="container-x">
          {categories.length > 0 && (
            <nav aria-label="Categories" className="mb-10 flex flex-wrap gap-2">
              <Link href="/blog" className={`rounded-full px-4 py-2 text-sm font-medium ${!sp.category ? "bg-navy text-white" : "bg-surface text-fg"}`} aria-current={!sp.category ? "page" : undefined}>All</Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/blog?category=${c.slug}`} className={`rounded-full px-4 py-2 text-sm font-medium ${sp.category === c.slug ? "bg-navy text-white" : "bg-surface text-fg"}`} aria-current={sp.category === c.slug ? "page" : undefined}>{c.name}</Link>
              ))}
            </nav>
          )}
          {posts.length === 0 ? (
            <p className="text-muted">No articles published yet. Please check back soon.</p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.id} data-reveal>
                  <article className="card relative flex h-full flex-col overflow-hidden p-0">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" width={640} height={360} />
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-navy to-navy-700" aria-hidden />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{p.category?.name ?? "Article"} · {readingTime(p.body)} min read</p>
                      <h2 className="mt-2 text-lg font-semibold text-fg"><Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0 hover:text-link">{p.title}</Link></h2>
                      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{p.excerpt}</p>
                      {p.publishedAt && <time dateTime={p.publishedAt.toISOString()} className="mt-4 text-xs text-muted">{p.publishedAt.toLocaleDateString("en-IN", { dateStyle: "long" })}</time>}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={qs(n)} aria-current={n === pageNo ? "page" : undefined} className={`flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium ${n === pageNo ? "bg-navy text-white" : "bg-surface text-fg"}`}>{n}</Link>
              ))}
            </nav>
          )}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
