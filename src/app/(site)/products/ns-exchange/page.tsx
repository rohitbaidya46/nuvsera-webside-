import Link from "next/link";
import {
  ArrowRight, BarChart3, Boxes, FileSearch, KeyRound, Layers, LayoutDashboard, ShieldAlert, Users2, Wallet,
} from "lucide-react";
import { CtaBanner } from "@/components/site/CtaBanner";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getFaqs, getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata("/products/ns-exchange", {
    title: "NS Exchange — Crypto Exchange Platform by Nuvsera Technology",
    description: "NS Exchange is the crypto exchange platform of the Nuvsera Technology group: spot and P2P trading, secure wallets, KYC/AML-ready onboarding and a complete operator console.",
  }, await getPage("ns-exchange"));
}

const MODULES = [
  { icon: BarChart3, title: "Spot trading", text: "Order-book trading with limit, market and stop orders, a high-throughput matching engine and real-time market data over WebSockets." },
  { icon: Users2, title: "P2P marketplace", text: "Peer-to-peer buy and sell with escrow, configurable payment methods, dispute handling and merchant reputation." },
  { icon: Wallet, title: "Wallet infrastructure", text: "Hot / warm / cold wallet segregation, withdrawal whitelists, multi-approval workflows and on-chain monitoring." },
  { icon: KeyRound, title: "KYC / AML-ready", text: "Pluggable identity-verification providers, risk scoring, transaction monitoring hooks and record-keeping for reporting." },
  { icon: LayoutDashboard, title: "Operator console", text: "Role-based admin for markets, fees, users, withdrawals, support tickets, audit trails and financial reconciliation." },
  { icon: Layers, title: "Liquidity & integrations", text: "Market-maker APIs, liquidity connectors, payment gateway and banking integrations, and a documented public API." },
];

const SECURITY = [
  "Two-factor authentication and device management for every user",
  "Encryption in transit and at rest; secrets held in a managed vault",
  "Rate limiting, anti-bot and anomaly detection on sensitive actions",
  "Immutable audit logs for every administrative change",
  "Independent penetration testing before each major release",
  "Segregated environments with least-privilege access",
];

export default async function NsExchangePage() {
  const [page, faqs] = await Promise.all([getPage("ns-exchange"), getFaqs("ns-exchange")]);
  return (
    <>
      <PageHero
        eyebrow="Our product"
        title={page?.title || "NS Exchange"}
        intro={page?.intro || "NS Exchange is the digital-asset exchange platform of the Nuvsera Technology group. We built it to the standard we would expect as users — fast, transparent and secure — and we use the same platform to help other businesses launch exchanges of their own."}
        crumbs={[{ href: "/products/ns-exchange", label: "NS Exchange" }]}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/get-a-quote?service=crypto-exchange-development" className="btn-gold">Launch your own exchange <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <Link href="/contact?service=crypto-exchange-development" className="btn-ghost-light">Request a demo</Link>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="modules">
        <div className="container-x">
          <SectionHeading id="modules" eyebrow="Platform" title="Everything an exchange needs, built as modules" intro="Use the complete platform or only the modules you need. Each module is documented, tested and deployable on your own cloud account." />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(({ icon: Icon, title, text }) => (
              <li key={title} data-reveal className="card">
                <Icon className="h-7 w-7 text-brand-700 dark:text-gold" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-fg">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-surface" aria-labelledby="security">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div data-reveal="left">
            <p className="eyebrow">Security</p>
            <h2 id="security" className="h-section mt-3 text-fg">Security is the product</h2>
            <p className="lead mt-4">An exchange holds other people’s assets. Our security programme is designed around that responsibility, with defence in depth at every layer — application, infrastructure, wallets and people.</p>
          </div>
          <ul className="grid gap-3" data-reveal>
            {SECURITY.map((s) => (
              <li key={s} className="flex items-start gap-3 rounded-xl border border-line bg-card p-4 text-sm font-medium text-fg">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-gold" aria-hidden /> {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="white-label">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div data-reveal>
            <p className="eyebrow">For businesses</p>
            <h2 id="white-label" className="h-section mt-3 text-fg">Build the exchange platform of the future on blockchain</h2>
            <p className="lead mt-4">Planning to launch a crypto exchange, a tokenised-asset marketplace or a brokerage? We adapt the NS Exchange codebase to your brand, markets and compliance requirements, then support you through launch and beyond.</p>
            <ul className="mt-6 space-y-3 text-sm text-fg">
              {[
                [Boxes, "Custom branding, markets, fee structures and user journeys"],
                [FileSearch, "Compliance-ready workflows designed with your legal advisers"],
                [LayoutDashboard, "Deployment to your own cloud account — you own the infrastructure"],
              ].map(([Icon, t]) => {
                const I = Icon as typeof Boxes;
                return <li key={t as string} className="flex items-center gap-3"><I className="h-5 w-5 text-brand-700 dark:text-gold" aria-hidden /> {t as string}</li>;
              })}
            </ul>
            <Link href="/services/crypto-exchange-development" className="btn-navy mt-8">Crypto exchange development <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div data-reveal className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            <h3 className="text-base font-semibold">Important information</h3>
            <p className="mt-2">
              Virtual digital assets (VDAs) are highly volatile and may be unregulated in some jurisdictions. Trading involves risk, including the
              possible loss of your entire investment. Gains on VDAs are taxable in India, and TDS may apply on transfers. Nothing on this page is
              financial, investment or tax advice.
            </p>
            <p className="mt-3">
              Operators launching an exchange in India are responsible for obtaining all registrations required by law, including
              registration with the Financial Intelligence Unit – India (FIU-IND) as a reporting entity under the PMLA, where applicable.
            </p>
            <p className="mt-3 rounded-lg border border-dashed border-amber-500 p-3 text-xs">
              [PLACEHOLDER — Regulatory status of NS Exchange: add registration details and the official NS Exchange website link once confirmed by the compliance team.]
            </p>
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section bg-surface" aria-labelledby="faq">
          <div className="container-x max-w-4xl">
            <SectionHeading id="faq" eyebrow="FAQ" title="NS Exchange — common questions" />
            <div className="mt-10"><FaqList items={faqs} /></div>
          </div>
        </section>
      )}

      <CtaBanner title="Want to see the platform in action?" text="Book a walkthrough of the trading interface and operator console with our product team." />
    </>
  );
}
