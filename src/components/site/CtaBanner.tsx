import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export function CtaBanner({ title = "Have a project in mind? Let’s talk.", text = "Share a few details and a senior engineer will get back to you within one business day with next steps — no obligation." }: { title?: string; text?: string }) {
  return (
    <section className="section">
      <div className="container-x">
        <div data-reveal className="relative overflow-hidden rounded-3xl bg-navy px-6 py-12 text-white sm:px-12 sm:py-16">
          <div className="bg-grid absolute inset-0" aria-hidden />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">{text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/get-a-quote" className="btn-gold">Get a Free Quote <ArrowRight className="h-4 w-4" aria-hidden /></Link>
              <Link href="/contact" className="btn-ghost-light"><MessageCircle className="h-4 w-4" aria-hidden /> Talk to us</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
