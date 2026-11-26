import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { Magnetic } from "@/components/experience/Magnetic";
import { SplitText } from "@/components/experience/SplitText";
import { getSettings } from "@/lib/settings";
import { WhatsAppIcon } from "./FloatingActions";
import { LogoMark } from "./Logo";

/** Contact CTA band: phone, WhatsApp and the project form. Phone/WhatsApp come from Site settings. */
export async function CtaBanner({ title = "Let’s build something secure.", text = "Share a few details and a senior engineer will reply within one business day with next steps. No obligation." }: { title?: string; text?: string }) {
  const { company: c } = await getSettings();
  return (
    <section className="section" aria-label="Contact us">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-br from-navy-800 via-navy to-navy-800 px-6 py-14 sm:px-14 sm:py-20">
          <div className="bg-grid absolute inset-0 opacity-60" aria-hidden />
          <LogoMark className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 opacity-[0.07]" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-gold/15 blur-3xl" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p data-reveal className="eyebrow">Start a conversation</p>
              <SplitText text={title} className="h-display mt-5 text-ivory" />
              <p data-reveal className="mt-6 max-w-xl text-lg leading-8 text-muted">{text}</p>
            </div>
            <div data-reveal className="space-y-5">
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="block font-serif text-4xl text-gold-gradient sm:text-5xl">{c.phone}</a>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Magnetic><Link href="/get-a-quote" className="btn-gold">Start a Project <ArrowRight className="h-4 w-4" aria-hidden /></Link></Magnetic>
                <Magnetic><a href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent("Hello Nuvsera Technology, I would like to discuss a project.")}`} target="_blank" rel="noopener noreferrer" className="btn-ghost-light"><WhatsAppIcon className="h-4 w-4" /> WhatsApp us</a></Magnetic>
                <Magnetic><a href={`tel:${c.phone.replace(/\s/g, "")}`} className="btn-ghost-light"><Phone className="h-4 w-4" aria-hidden /> Call</a></Magnetic>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
