import { cookies, headers } from "next/headers";
import { CONSENT_COOKIE, CONSENT_VERSION } from "@/lib/constants";
import { getServices } from "@/lib/content";
import { env } from "@/lib/env";
import { fullAddress, getSettings } from "@/lib/settings";
import { LazyExperienceLayer as ExperienceLayer } from "@/components/experience/LazyExperienceLayer";
import { Preloader } from "@/components/experience/Preloader";
import { AttributionTracker } from "./AttributionTracker";
import { ConsentManager } from "./ConsentManager";
import { FloatingActions } from "./FloatingActions";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JsonLd } from "./JsonLd";
import { RevealObserver } from "./RevealObserver";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, services, h, jar] = await Promise.all([getSettings(), getServices(), headers(), cookies()]);
  let hasConsent = false;
  try {
    hasConsent = JSON.parse(decodeURIComponent(jar.get(CONSENT_COOKIE)?.value || "null"))?.v === CONSENT_VERSION;
  } catch {
    /* malformed cookie: ask again */
  }
  // The home page has its own cinematic 3D intro, so the generic crest preloader is skipped there.
  const isHome = h.get("x-pathname") === "/";
  const c = settings.company;
  const nav = services.map(({ slug, title, shortDescription, icon }) => ({ slug, title, shortDescription, icon }));
  const sameAs = Object.values(settings.social).filter(Boolean);
  return (
    <>
      {!isHome && <Preloader />}
      <Header services={nav} phone={c.phone} logoUrl={c.logoUrl || undefined} />
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      <Footer settings={settings} services={nav} />
      <FloatingActions whatsapp={c.whatsapp} phone={c.phone} />
      <ConsentManager tracking={settings.tracking} initialOpen={!hasConsent} />
      <AttributionTracker />
      <RevealObserver />
      <ExperienceLayer />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${env.appUrl}/#organization`,
              name: c.legalName,
              alternateName: c.brandName,
              url: env.appUrl,
              logo: `${env.appUrl}/icon.svg`,
              slogan: c.tagline,
              email: c.email,
              telephone: c.phone,
              taxID: c.gstin,
              address: {
                "@type": "PostalAddress",
                streetAddress: `${c.addressLine1}, ${c.addressLine2}`,
                addressLocality: c.city,
                addressRegion: c.state,
                postalCode: c.postalCode,
                addressCountry: "IN",
              },
              contactPoint: [
                { "@type": "ContactPoint", contactType: "sales", telephone: c.phone, email: c.projectsEmail || c.email, areaServed: ["IN", "Worldwide"], availableLanguage: ["en", "hi", "bn"] },
                { "@type": "ContactPoint", contactType: "customer support", telephone: c.phone, email: c.supportEmail || c.email },
              ],
              identifier: [
                { "@type": "PropertyValue", propertyID: "CIN", value: c.cin },
                { "@type": "PropertyValue", propertyID: "GSTIN", value: c.gstin },
                { "@type": "PropertyValue", propertyID: "Udyam", value: c.udyam },
              ],
              owns: { "@type": "Brand", name: "NS Exchange", url: "https://nsexchange.com" },
              ...(sameAs.length ? { sameAs } : {}),
            },
            {
              "@type": ["LocalBusiness", "ProfessionalService"],
              "@id": `${env.appUrl}/#localbusiness`,
              name: c.brandName,
              parentOrganization: { "@id": `${env.appUrl}/#organization` },
              url: env.appUrl,
              image: `${env.appUrl}/og-default.png`,
              telephone: c.phone,
              email: c.email,
              priceRange: "₹₹",
              address: {
                "@type": "PostalAddress",
                streetAddress: `${c.addressLine1}, ${c.addressLine2}`,
                addressLocality: c.city,
                addressRegion: c.state,
                postalCode: c.postalCode,
                addressCountry: "IN",
              },
              geo: { "@type": "GeoCoordinates", latitude: 22.5513, longitude: 88.3524 },
              openingHoursSpecification: [
                { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:00", closes: "19:00" },
              ],
              areaServed: ["IN", "Worldwide"],
              description: fullAddress(c),
            },
          ],
        }}
      />
    </>
  );
}
