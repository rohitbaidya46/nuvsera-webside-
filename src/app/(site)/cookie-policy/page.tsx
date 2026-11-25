import { LegalPage, legalMetadata } from "@/components/site/LegalPage";

export const generateMetadata = () => legalMetadata("cookie-policy", "How Nuvsera Technology uses strictly necessary, analytics and marketing cookies, and how to change your choice at any time.");

export default function Page() {
  return <LegalPage slug="cookie-policy" />;
}
