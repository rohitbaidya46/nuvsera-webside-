import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { QuoteWizard } from "@/components/site/forms/QuoteWizard";
import { getPage, getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata("/get-a-quote", {
    title: "Get a Free Quote",
    description: "Request a free, no-obligation quote for software, web, mobile, blockchain, crypto exchange, AI, cybersecurity or analytics projects. Four quick steps.",
  }, await getPage("get-a-quote"));
}

type Props = { searchParams: Promise<{ service?: string }> };

export default async function QuotePage({ searchParams }: Props) {
  const [page, services, sp] = await Promise.all([getPage("get-a-quote"), getServices(), searchParams]);
  return (
    <>
      <PageHero eyebrow="Free quote" title={page?.title || "Get a free, itemised quote"} intro={page?.intro || "Four short steps. We reply within one business day with questions or a proposed scope, timeline and cost."} crumbs={[{ href: "/get-a-quote", label: "Get a Quote" }]} />
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          <div className="card sm:p-8 lg:col-span-2">
            <QuoteWizard services={services.map(({ slug, title, shortDescription, icon }) => ({ slug, title, shortDescription, icon }))} defaultService={sp.service} />
          </div>
          <aside className="space-y-4">
            <div className="card bg-surface">
              <h2 className="font-semibold text-fg">What happens next?</h2>
              <ol className="mt-4 space-y-4 text-sm text-muted">
                {[
                  "We review your request and reply within one business day.",
                  "A short discovery call to clarify goals and constraints (under NDA if you prefer).",
                  "You receive an itemised proposal with milestones, timeline and GST shown separately.",
                  "Work starts only after you approve the proposal in writing.",
                ].map((t, i) => (
                  <li key={t} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">{i + 1}</span>{t}</li>
                ))}
              </ol>
            </div>
            <div className="card">
              <ul className="space-y-3 text-sm text-fg">
                {["Free and no obligation", "Your information stays confidential", "NDA available on request"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-brand-700 dark:text-gold" aria-hidden /> {t}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
