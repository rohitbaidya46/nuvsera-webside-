import { notFound } from "next/navigation";
import { Briefcase, Clock, MapPin } from "lucide-react";
import { JsonLd } from "@/components/site/JsonLd";
import { PageHero } from "@/components/site/PageHero";
import { ApplicationForm } from "@/components/site/forms/ApplicationForm";
import { getJob } from "@/lib/content";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const j = await getJob((await params).slug);
  if (!j) return {};
  return buildMetadata(`/careers/${j.slug}`, { title: `${j.title} — Careers`, description: j.summary });
}

export default async function JobPage({ params }: Props) {
  const [j, settings] = await Promise.all([getJob((await params).slug), getSettings()]);
  if (!j) notFound();
  const c = settings.company;
  return (
    <>
      <PageHero eyebrow={j.department} title={j.title} intro={j.summary} crumbs={[{ href: "/careers", label: "Careers" }, { href: `/careers/${j.slug}`, label: j.title }]}>
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden />{j.location}</span>
          <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4" aria-hidden />{j.employmentType}</span>
          {j.experience && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden />{j.experience}</span>}
        </p>
      </PageHero>
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-5">
          <div className="prose-site lg:col-span-3" dangerouslySetInnerHTML={{ __html: j.description }} />
          <div className="lg:col-span-2">
            <div className="card lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold text-fg">Apply for this role</h2>
              <div className="mt-6"><ApplicationForm jobId={j.id} /></div>
            </div>
          </div>
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: j.title,
          description: j.description,
          datePosted: j.createdAt.toISOString(),
          ...(j.closesAt ? { validThrough: j.closesAt.toISOString() } : {}),
          employmentType: j.employmentType.toUpperCase().replace(/[^A-Z]/g, "_"),
          hiringOrganization: { "@type": "Organization", name: c.legalName, sameAs: env.appUrl },
          jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", streetAddress: c.addressLine1, addressLocality: c.city, addressRegion: c.state, postalCode: c.postalCode, addressCountry: "IN" } },
        }}
      />
    </>
  );
}
