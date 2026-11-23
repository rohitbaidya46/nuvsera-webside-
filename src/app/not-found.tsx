import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteShell>
      <section className="section">
        <div className="container-x max-w-2xl text-center">
          <p className="text-7xl font-bold tracking-tight text-gold">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg sm:text-4xl">We couldn’t find that page</h1>
          <p className="lead mt-4">The link may be out of date or the page may have moved. Here are some useful places to continue:</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn-navy"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to home</Link>
            <Link href="/services" className="btn-outline"><Search className="h-4 w-4" aria-hidden /> Browse services</Link>
            <Link href="/contact" className="btn-outline">Contact us</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
