import { LegalPage, legalMetadata } from "@/components/site/LegalPage";

export const generateMetadata = () => legalMetadata("terms-and-conditions", "Terms governing use of the Nuvsera Technology website and our services, including payment and project-delivery terms.");

export default function Page() {
  return <LegalPage slug="terms-and-conditions" />;
}
