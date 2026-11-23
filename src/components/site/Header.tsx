"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { ServiceIcon } from "./icons";

type NavService = { slug: string; title: string; shortDescription: string; icon: string };

const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/process", label: "Our Process" },
  { href: "/careers", label: "Careers" },
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
        className={`inline-flex h-11 items-center gap-1 rounded-lg px-3 text-[15px] font-medium transition hover:text-fg ${active ? "text-fg" : "text-muted"}`}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">{children}</div>}
    </div>
  );
}

export function Header({ services, phone, logoUrl }: { services: NavService[]; phone: string; logoUrl?: string }) {
  const pathname = usePathname();
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setMobile(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const linkCls = (href: string) =>
    `inline-flex h-11 items-center rounded-lg px-3 text-[15px] font-medium transition hover:text-fg ${pathname.startsWith(href) ? "text-fg" : "text-muted"}`;

  return (
    <header className={`sticky top-0 z-50 border-b transition ${scrolled ? "border-line bg-bg/90 backdrop-blur-md" : "border-transparent bg-bg"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy">
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link href="/" className="shrink-0 rounded" aria-label="Nuvsera Technology — home">
          <Logo logoUrl={logoUrl} />
        </Link>

        <nav aria-label="Main" className="hidden items-center lg:flex">
          <Dropdown label="Services" active={pathname.startsWith("/services")}>
            <div className="w-[720px] rounded-2xl border border-line bg-card p-3 shadow-xl">
              <ul className="grid grid-cols-2 gap-1">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="flex gap-3 rounded-xl p-3 transition hover:bg-surface">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                        <ServiceIcon name={s.icon} className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-fg">{s.title}</span>
                        <span className="mt-0.5 block text-[13px] leading-5 text-muted line-clamp-2">{s.shortDescription}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/services" className="mt-2 block rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-link">
                View all services →
              </Link>
            </div>
          </Dropdown>
          <Link href="/products/ns-exchange" className={linkCls("/products")}>NS Exchange</Link>
          <Link href="/portfolio" className={linkCls("/portfolio")}>Portfolio</Link>
          <Dropdown label="Company" active={COMPANY.some((c) => pathname.startsWith(c.href))}>
            <ul className="w-56 rounded-2xl border border-line bg-card p-2 shadow-xl">
              {COMPANY.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-fg hover:bg-surface">{c.label}</Link>
                </li>
              ))}
            </ul>
          </Dropdown>
          <Link href="/blog" className={linkCls("/blog")}>Insights</Link>
          <Link href="/contact" className={linkCls("/contact")}>Contact</Link>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/get-a-quote" className="btn-gold hidden sm:inline-flex">Get a Quote</Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-fg lg:hidden"
            aria-expanded={mobile}
            aria-controls="mobile-nav"
            aria-label={mobile ? "Close menu" : "Open menu"}
            onClick={() => setMobile((m) => !m)}
          >
            {mobile ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>
      </div>

      {mobile && (
        <nav id="mobile-nav" aria-label="Mobile" className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-bg px-4 pb-28 pt-4 lg:hidden">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">Services</p>
          <ul className="grid gap-1">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[15px] font-medium text-fg hover:bg-surface">
                  <ServiceIcon name={s.icon} className="h-5 w-5 text-brand-700 dark:text-gold" />
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
          <hr className="my-4 border-line" />
          <ul className="grid gap-1">
            {[
              { href: "/products/ns-exchange", label: "NS Exchange" },
              { href: "/portfolio", label: "Portfolio" },
              ...COMPANY,
              { href: "/blog", label: "Insights" },
              { href: "/contact", label: "Contact Us" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded-lg px-2 py-2.5 text-[15px] font-medium text-fg hover:bg-surface">{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3">
            <Link href="/get-a-quote" className="btn-gold w-full">Get a Free Quote</Link>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="btn-outline w-full">
              <Phone className="h-4 w-4" aria-hidden /> Call {phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
