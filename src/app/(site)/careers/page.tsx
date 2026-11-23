import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap, HeartHandshake, MapPin, Rocket } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ApplicationForm } from "@/components/site/forms/ApplicationForm";
import { getJobs, getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata("/careers", {
    title: "Careers — Software, Blockchain & Security Jobs in Kolkata",
    description: "Join Nuvsera Technology in Kolkata. Open roles in software engineering, blockchain, mobile, cybersecurity and design.",
  }, await getPage("careers"));
}

const PERKS = [
  { icon: Rocket, title: "Real ownership", text: "Work on production systems — including our own exchange platform — from your first month." },
  { icon: GraduationCap, title: "Learning budget", text: "Certifications, courses and conference time supported by the company." },
  { icon: HeartHandshake, title: "Respectful culture", text: "Clear expectations, sensible hours and leaders who answer questions honestly." },
];

export default async function CareersPage() {
  const [page, jobs] = await Promise.all([getPage("careers"), getJobs()]);
  return (
    <>
      <PageHero eyebrow="Careers" title={page?.title || "Build what matters, with people who care how it is built"} intro={page?.intro || "We are growing a team of engineers, designers and security specialists in Kolkata. If you value craft and responsibility, we would like to hear from you."} crumbs={[{ href: "/careers", label: "Careers" }]} />
      <section className="section">
        <div className="container-x">
          <ul className="grid gap-5 md:grid-cols-3">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card" data-reveal>
                <Icon className="h-7 w-7 text-brand-700 dark:text-gold" aria-hidden />
                <h2 className="mt-4 text-lg font-semibold text-fg">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section bg-surface" aria-labelledby="openings">
        <div className="container-x">
          <SectionHeading id="openings" eyebrow="Open positions" title={jobs.length ? `${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}` : "No open roles right now"} intro={jobs.length ? undefined : "We are always glad to meet talented people. Send a general application below and we will contact you when a suitable role opens."} />
          {jobs.length > 0 && (
            <ul className="mt-10 grid gap-4">
              {jobs.map((j) => (
                <li key={j.id} data-reveal>
                  <Link href={`/careers/${j.slug}`} className="card group flex flex-col gap-4 hover:border-brand/40 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-fg">{j.title}</h3>
                      <p className="mt-1 text-sm text-muted">{j.summary}</p>
                      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                        <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4" aria-hidden />{j.department} · {j.employmentType}</span>
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{j.location}</span>
                        {j.experience && <span>{j.experience}</span>}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-link">View &amp; apply <ArrowRight className="h-4 w-4" aria-hidden /></span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className="section" aria-labelledby="apply">
        <div className="container-x max-w-3xl">
          <h2 id="apply" className="h-section text-fg">{jobs.length ? "Apply" : "General application"}</h2>
          <p className="mt-3 text-muted">Choose a position (or leave it as a general application) and attach your CV.</p>
          <div className="card mt-8"><ApplicationForm jobs={jobs.map((j) => ({ id: j.id, title: j.title }))} /></div>
        </div>
      </section>
    </>
  );
}
