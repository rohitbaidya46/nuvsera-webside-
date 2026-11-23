import { Compass, Handshake, Lightbulb, ShieldCheck, UserRound } from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getPage, getTeam } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return buildMetadata("/about", {
    title: "About Us — Nuvsera Technology Private Limited, Kolkata",
    description: "Nuvsera Technology is a Kolkata-based software, blockchain and cybersecurity company and the parent company of the NS Exchange crypto exchange platform.",
  }, await getPage("about"));
}

const VALUES = [
  { icon: ShieldCheck, title: "Integrity", text: "We say what we will do, do what we said, and tell you early when something changes." },
  { icon: Lightbulb, title: "Craft", text: "Clean architecture, readable code and thoughtful design — because software outlives its first release." },
  { icon: Handshake, title: "Partnership", text: "We measure success by your outcomes, not by hours billed." },
  { icon: Compass, title: "Responsibility", text: "We treat your users’ data and money as if they were our own." },
];

export default async function AboutPage() {
  const [page, team, settings] = await Promise.all([getPage("about"), getTeam(), getSettings()]);
  const c = settings.company;
  return (
    <>
      <PageHero eyebrow="About us" title={page?.title || "Engineering trust into every product we build"} intro={page?.intro} crumbs={[{ href: "/about", label: "About Us" }]} />
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="prose-site lg:col-span-2" dangerouslySetInnerHTML={{ __html: page?.body || "" }} />
          <aside className="card h-fit bg-surface">
            <h2 className="text-lg font-semibold text-fg">Company information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Legal name", c.legalName],
                ["CIN", c.cin],
                ["GSTIN", c.gstin],
                ["Udyam registration", `${c.udyam} (${c.udyamCategory})`],
                ["Registered office", `${c.addressLine1}, ${c.addressLine2}, ${c.city} – ${c.postalCode}, ${c.state}`],
                ["Group company", "NS Exchange (crypto exchange platform)"],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-muted">{k}</dt><dd className="font-medium text-fg">{v}</dd></div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="section bg-surface" aria-labelledby="values">
        <div className="container-x">
          <SectionHeading id="values" eyebrow="Our values" title="What we stand for" />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title} data-reveal className="card">
                <Icon className="h-7 w-7 text-brand-700 dark:text-gold" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-fg">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="team">
        <div className="container-x">
          <SectionHeading id="team" eyebrow="Leadership" title="The people behind Nuvsera" />
          {team.length > 0 ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m) => (
                <li key={m.id} data-reveal className="card text-center">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={`Portrait of ${m.name}`} className="mx-auto h-28 w-28 rounded-full object-cover" width={112} height={112} loading="lazy" />
                  ) : (
                    <span className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-surface text-muted" aria-hidden>
                      <UserRound className="h-12 w-12" />
                    </span>
                  )}
                  <h3 className="mt-4 font-semibold text-fg">{m.name}</h3>
                  <p className="text-sm text-muted">{m.designation}</p>
                  {m.bio && <p className="mt-3 text-sm leading-6 text-muted">{m.bio}</p>}
                  {m.linkedin && <a href={m.linkedin} className="link mt-3 inline-block text-sm" target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> profile of {m.name}</span></a>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-muted">Team profiles will be published soon.</p>
          )}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
