import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GoldRule, SplitText } from "@/components/experience/SplitText";
import { JsonLd } from "./JsonLd";
import { env } from "@/lib/env";

type Crumb = { href: string; label: string };

export function PageHero({ eyebrow, title, intro, crumbs = [], children, aside }: { eyebrow?: string; title: string; intro?: string | null; crumbs?: Crumb[]; children?: React.ReactNode; aside?: React.ReactNode }) {
  const all = [{ href: "/", label: "Home" }, ...crumbs];
  return (
    <section className="relative overflow-hidden">
      <div className="bg-vignette absolute inset-0" aria-hidden />
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
      <div className={`container-x relative grid items-center gap-10 py-16 sm:py-24 ${aside ? "lg:grid-cols-[1.2fr_1fr]" : ""}`}>
        <div>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted">
              {all.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
                  {i === all.length - 1 ? (
                    <span aria-current="page" className="text-gold">{c.label}</span>
                  ) : (
                    <Link href={c.href} className="hover:text-ivory">{c.label}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {eyebrow && <p className="eyebrow mt-10">{eyebrow}</p>}
          <SplitText as="h1" text={title} className={`${eyebrow ? "mt-5" : "mt-10"} h-display max-w-4xl text-ivory`} />
          {intro && <p data-reveal style={{ ["--reveal-delay" as string]: "200ms" }} className="mt-6 max-w-3xl text-lg leading-8 text-muted text-pretty">{intro}</p>}
          {children && <div data-reveal style={{ ["--reveal-delay" as string]: "300ms" }}>{children}</div>}
        </div>
        {aside}
      </div>
      <GoldRule />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${env.appUrl}${c.href}` })),
        }}
      />
    </section>
  );
}
