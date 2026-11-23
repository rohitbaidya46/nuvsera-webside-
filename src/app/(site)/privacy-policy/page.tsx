import { LegalPage, legalMetadata } from "@/components/site/LegalPage";

export const generateMetadata = () => legalMetadata("privacy-policy", "How Nuvsera Technology collects, uses and protects personal data under India’s Digital Personal Data Protection Act, 2023.");

export default function Page() {
  return <LegalPage slug="privacy-policy" />;
}
