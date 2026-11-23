import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ConversionTracker } from "@/components/site/ConversionTracker";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Thank you", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ type?: string }> };

export default async function ThankYouPage({ searchParams }: Props) {
  const [{ type = "contact" }, settings] = await Promise.all([searchParams, getSettings()]);
  const isApplication = type === "application";
  return (
    <section className="section">
      <ConversionTracker kind={type} />
      <div className="container-x max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" aria-hidden />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          {isApplication ? "Application received — thank you!" : "Thank you — we’ve received your enquiry"}
        </h1>
        <p className="lead mt-4">
          {isApplication
            ? "Our hiring team will review your profile. If your experience matches the role, we will contact you to arrange a conversation."
            : "A confirmation email is on its way to you. A member of our team will reply within one business day."}
        </p>
        {!isApplication && (
          <p className="mt-4 text-muted">
            Need to talk sooner? Call or WhatsApp us on{" "}
            <a href={`tel:${settings.company.phone.replace(/\s/g, "")}`} className="link">{settings.company.phone}</a>.
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-navy">Back to home</Link>
          <Link href="/blog" className="btn-outline">Read our insights</Link>
        </div>
      </div>
    </section>
  );
}
