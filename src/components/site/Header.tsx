"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { Magnetic } from "@/components/experience/Magnetic";
import { Logo } from "./Logo";
import { ServiceIcon } from "./icons";

type NavService = { slug: string; title: string; shortDescription: string; icon: string };

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/process", label: "Our Process" },
  { href: "/careers", label: "Careers" },
  { href: "/blog", label: "Insights" },
];

function Dropdown({ label, children, active }: { label: string; children: React.ReactNode; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-11 items-center gap-1 px-3 text-[13px] font-medium uppercase tracking-[0.16em] transition hover:text-gold ${active ? "text-gold" : "text-ivory/80"}`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">{children}</div>}
    </div>
  );
}

export function Header({ services, phone, logoUrl }: { services: NavService[]; phone: string; logoUrl?: string }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setMobile(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const linkCls = (href: string) =>
    `relative inline-flex h-11 items-center px-3 text-[13px] font-medium uppercase tracking-[0.16em] transition hover:text-gold ${pathname.startsWith(href) ? "text-gold" : "text-ivory/80"}`;

  return (
    <header className={`sticky top-0 z-50 transition duration-500 ${scrolled ? "border-b border-gold/15 bg-navy/80 backdrop-blur-xl" : "border-b border-transparent bg-navy/0"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy">
        Skip to content
      </a>
      <div className="container-x flex h-[72px] items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="shrink-0 rounded" aria-label="Nuvsera Technology — home">
          <Logo logoUrl={logoUrl} />
        </Link>

        <nav aria-label="Main" className="hidden items-center lg:flex">
          <Dropdown label="Services" active={pathname.startsWith("/services")}>
            <div className="w-[680px] rounded-2xl border border-gold/20 bg-navy-800/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <ul className="grid grid-cols-2 gap-1">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="group flex gap-3 rounded-xl p-3 transition hover:bg-white/[0.04]">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-navy">
                        <ServiceIcon name={s.icon} className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ivory">{s.title}</span>
                        <span className="mt-0.5 block text-[13px] leading-5 text-muted line-clamp-2">{s.shortDescription}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/services" className="mt-2 flex items-center justify-between rounded-xl border border-gold/15 px-4 py-3 text-sm font-semibold text-gold hover:bg-gold/[0.06]">
                View all services <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Dropdown>
          <Link href="/products/ns-exchange" className={linkCls("/products")}>NS Exchange</Link>
          <Link href="/portfolio" className={linkCls("/portfolio")}>Work</Link>
          <Dropdown label="Company" active={COMPANY.some((c) => pathname.startsWith(c.href))}>
            <ul className="w-56 rounded-2xl border border-gold/20 bg-navy-800/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {COMPANY.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ivory hover:bg-white/[0.04] hover:text-gold">{c.label}</Link>
                </li>
              ))}
            </ul>
          </Dropdown>
          <Link href="/contact" className={linkCls("/contact")}>Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="hidden items-center gap-2 px-2 text-[13px] font-medium tracking-wide text-ivory/80 hover:text-gold xl:inline-flex">
            <Phone className="h-4 w-4 text-gold" aria-hidden /> {phone}
          </a>
          <Magnetic className="hidden sm:inline-flex">
            <Link href="/get-a-quote" className="btn-gold">Start a Project</Link>
          </Magnetic>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-ivory lg:hidden"
            aria-expanded={mobile}
            aria-controls="mobile-nav"
            aria-label={mobile ? "Close menu" : "Open menu"}
            onClick={() => setMobile((m) => !m)}
          >
            {mobile ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {mobile && (
        <nav id="mobile-nav" aria-label="Mobile" className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto border-t border-gold/15 bg-navy px-4 pb-28 pt-4 lg:hidden">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold">Services</p>
          <ul className="grid gap-1">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] font-medium text-ivory hover:bg-white/[0.04]">
                  <ServiceIcon name={s.icon} className="h-5 w-5 text-gold" />
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
          <hr className="my-4 border-gold/15" />
          <ul className="grid gap-1">
            {[{ href: "/products/ns-exchange", label: "NS Exchange" }, { href: "/portfolio", label: "Work" }, ...COMPANY, { href: "/contact", label: "Contact" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-lg px-2 py-2.5 font-display text-lg tracking-[0.08em] text-ivory hover:bg-white/[0.04]">{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3">
            <Link href="/get-a-quote" className="btn-gold w-full">Start a Project</Link>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn-outline w-full">
              <Phone className="h-4 w-4" aria-hidden /> Call {phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
