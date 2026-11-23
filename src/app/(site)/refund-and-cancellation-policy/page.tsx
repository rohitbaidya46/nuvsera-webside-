import { LegalPage, legalMetadata } from "@/components/site/LegalPage";

export const generateMetadata = () => legalMetadata("refund-and-cancellation-policy", "Refund and cancellation terms for projects, retainers and support plans from Nuvsera Technology.");

export default function Page() {
  return <LegalPage slug="refund-and-cancellation-policy" />;
}
