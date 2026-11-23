import { CtaBanner } from "@/components/site/CtaBanner";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { PROCESS_STEPS } from "@/components/site/ProcessTimeline";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getFaqs, getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata("/process", {
    title: "Our Process — Discover, Design, Develop, Test, Launch, Support",
    description: "How Nuvsera Technology delivers software projects: a transparent six-step process with fixed milestones, sprint demos, security testing and post-launch support.",
  }, await getPage("process"));
}

const DETAIL: Record<string, { you: string; we: string; output: string }> = {
  Discover: { you: "Share goals, users, constraints and any existing systems.", we: "Run workshops, review technical risks and research the market.", output: "Scope document, itemised estimate and delivery plan." },
  Design: { you: "Review and approve journeys, wireframes and visual designs.", we: "Create architecture, data model, UX flows and UI design system.", output: "Signed-off designs and technical specification." },
  Develop: { you: "Attend sprint demos and give feedback.", we: "Build in two-week sprints with code review and CI on every change.", output: "Working software in a staging environment after every sprint." },
  Test: { you: "Carry out user-acceptance testing.", we: "Automated tests, manual QA, performance and security testing.", output: "Test report, security findings resolved, UAT sign-off." },
  Launch: { you: "Approve go-live.", we: "Deploy, monitor, and stand by with a rollback plan.", output: "Live product, documentation, credentials and source handover." },
  Support: { you: "Report issues and plan the next phase.", we: "Warranty fixes, monitoring, updates and improvements.", output: "Stable, maintained product and a forward roadmap." },
};

export default async function ProcessPage() {
  const [page, faqs] = await Promise.all([getPage("process"), getFaqs("process")]);
  return (
    <>
      <PageHero eyebrow="Our process" title={page?.title || "A transparent process, from first call to long-term support"} intro={page?.intro || "Predictable delivery is not luck. It is the result of a clear process, honest communication and the discipline to follow both."} crumbs={[{ href: "/process", label: "Our Process" }]} />
      <section className="section">
        <div className="container-x">
          <ol className="space-y-6">
            {PROCESS_STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} data-reveal className="card grid gap-6 lg:grid-cols-12">
                <div className="flex items-start gap-4 lg:col-span-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-gold"><Icon className="h-6 w-6" aria-hidden /></span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Step {i + 1}</p>
                    <h2 className="text-xl font-semibold text-fg">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                  </div>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-3 lg:col-span-8">
                  <div className="rounded-xl bg-surface p-4"><dt className="font-semibold text-fg">Your role</dt><dd className="mt-1 text-muted">{DETAIL[title].you}</dd></div>
                  <div className="rounded-xl bg-surface p-4"><dt className="font-semibold text-fg">Our role</dt><dd className="mt-1 text-muted">{DETAIL[title].we}</dd></div>
                  <div className="rounded-xl bg-surface p-4"><dt className="font-semibold text-fg">You receive</dt><dd className="mt-1 text-muted">{DETAIL[title].output}</dd></div>
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </section>
      {faqs.length > 0 && (
        <section className="section bg-surface">
          <div className="container-x max-w-4xl">
            <SectionHeading eyebrow="FAQ" title="Questions about working with us" />
            <div className="mt-10"><FaqList items={faqs} /></div>
          </div>
        </section>
      )}
      <CtaBanner />
    </>
  );
}
