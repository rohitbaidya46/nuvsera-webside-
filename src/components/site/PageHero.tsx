import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { env } from "@/lib/env";

type Crumb = { href: string; label: string };

export function PageHero({ eyebrow, title, intro, crumbs = [], children }: { eyebrow?: string; title: string; intro?: string | null; crumbs?: Crumb[]; children?: React.ReactNode }) {
  const all = [{ href: "/", label: "Home" }, ...crumbs];
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/25 blur-3xl" aria-hidden />
      <div className="container-x relative py-14 sm:py-20">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-300">
            {all.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
                {i === all.length - 1 ? (
                  <span aria-current="page" className="text-white">{c.label}</span>
                ) : (
                  <Link href={c.href} className="hover:text-white hover:underline">{c.label}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-gold">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-3" : "mt-8"} max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-5xl`}>{title}</h1>
        {intro && <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300 text-pretty">{intro}</p>}
        {children}
      </div>
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
