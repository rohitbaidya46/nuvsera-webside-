// Original copy for the five service pages. Editable afterwards in Admin → Content → Services.

type Seed = {
  slug: string;
  title: string;
  icon: string;
  shortDescription: string;
  overview: string;
  deliverables: string[];
  techStack: string[];
  process: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  featured?: boolean;
};

export const SERVICES: Seed[] = [
  {
    slug: "custom-software-development",
    title: "Custom Software & Web/Mobile Apps",
    icon: "code",
    featured: true,
    shortDescription: "Business applications, web platforms and iOS/Android apps engineered around the way your organisation actually works.",
    overview: `<p>Off-the-shelf software forces you to adapt your business to someone else’s assumptions. Custom software does the opposite: it encodes your processes, approvals and reporting exactly as you run them, and it grows with you.</p>
<p>We design and build line-of-business applications, customer portals, SaaS products, websites and native or cross-platform mobile apps. Every build is accessible, fast on Indian mobile networks, integrated cleanly with the systems you already use (Tally, SAP, Zoho, payment gateways, government portals) and documented well enough for any competent team to maintain.</p>
<h3>When custom software makes sense</h3>
<ul><li>Spreadsheets and manual hand-offs are slowing your team down or causing errors.</li><li>Your current system cannot be configured to fit a core process.</li><li>You need to connect several tools into one reliable workflow.</li><li>You are building a software product to sell to your own customers.</li></ul>`,
    deliverables: [
      "Custom business applications, ERP modules and internal tools",
      "Customer portals, dashboards and multi-tenant SaaS products",
      "Corporate websites and web applications (Next.js, React)",
      "iOS and Android apps (Flutter, React Native or native)",
      "Integrations with Tally, SAP, Zoho, GST, UPI and payment APIs",
      "Legacy modernisation, data migration and cloud deployment",
    ],
    techStack: ["TypeScript", "Next.js", "React", "Node.js", "Python", "Flutter", "React Native", "PostgreSQL", "Redis", "Docker", "AWS"],
    process: [
      { title: "Discover", description: "We sit with the people who do the work and map processes, pain points and the data that flows between them." },
      { title: "Design", description: "Architecture, data model and clickable prototypes so you can validate the solution before development begins." },
      { title: "Build", description: "Two-week sprints with working software demonstrated at the end of each sprint." },
      { title: "Secure", description: "Code review, dependency scanning and a security test before every major release." },
      { title: "Launch", description: "Data migration, user training, a supported go-live and a warranty period." },
    ],
    faqs: [
      { question: "How much does custom software cost?", answer: "It depends on scope. After a short discovery call we provide an itemised, milestone-based estimate in INR or USD with GST shown separately. Larger programmes are phased so you see value early." },
      { question: "Will we own the source code?", answer: "Yes. On final payment, full ownership of the source code, documentation and deployment configuration transfers to you, as set out in our Terms & Conditions." },
      { question: "Native or cross-platform mobile?", answer: "Cross-platform (Flutter or React Native) suits most business apps and saves cost. We recommend native when an app needs deep hardware access or maximum performance." },
      { question: "Do you sign an NDA?", answer: "Yes. We are happy to sign a mutual NDA before you share any confidential information." },
    ],
  },
  {
    slug: "blockchain-crypto-exchange-development",
    title: "Blockchain & Crypto Exchange Development",
    icon: "exchange",
    featured: true,
    shortDescription: "Spot and P2P exchanges, custody-aware wallet infrastructure and KYC/AML-ready operations: the engineering behind NS Exchange.",
    overview: `<p>Launching a digital-asset exchange means getting dozens of difficult things right at once: a fast and fair matching engine, wallet security, KYC and AML workflows, reconciliation, customer support and an operator console your compliance team can trust. We built <a href="https://nsexchange.com" rel="noopener">NS Exchange</a>, our own exchange, and bring that experience to your platform.</p>
<p>We deliver custom and white-label exchanges and permissioned blockchain systems, deployed to your own infrastructure, with your branding, markets and fee structures. Compliance-related features are built to work with your chosen KYC providers and your legal advisers’ requirements, including the record-keeping and reporting typically needed for registration with FIU-IND.</p>`,
    deliverables: [
      "Spot exchange with order book and high-performance matching engine",
      "P2P marketplace with escrow and dispute management",
      "Hot / warm / cold wallet architecture with multi-approval withdrawals",
      "KYC/AML-ready onboarding and transaction-monitoring hooks",
      "Operator console: markets, fees, users, reconciliation, reports and audit logs",
      "Permissioned ledgers and blockchain integrations for enterprises",
    ],
    techStack: ["Go", "Node.js", "TypeScript", "React", "Flutter", "PostgreSQL", "Redis", "Kafka", "Kubernetes", "Hyperledger Fabric", "AWS"],
    process: [
      { title: "Discover", description: "Markets, revenue model, jurisdictions, KYC providers and compliance obligations, scoped with your advisers." },
      { title: "Design", description: "Matching engine, custody model, threat model and infrastructure plan." },
      { title: "Build", description: "Core exchange, wallets, admin console and apps, demonstrated sprint by sprint." },
      { title: "Secure", description: "Penetration testing, load testing and rehearsed wallet procedures before launch." },
      { title: "Launch", description: "Phased launch, monitoring and ongoing feature development." },
    ],
    faqs: [
      { question: "Is this the same technology as NS Exchange?", answer: "Our exchange practice builds on the platform and experience behind NS Exchange, adapted to each client’s requirements." },
      { question: "Do you help with regulatory registration?", answer: "We build the technical capabilities typically needed for compliance (KYC, record-keeping, reporting and audit trails) and work with your legal advisers. Registration itself, for example with FIU-IND, remains the operator’s responsibility." },
      { question: "How long does it take to launch an exchange?", answer: "A launch with standard features can take a few months; fully custom platforms take longer. We provide a detailed plan after discovery." },
      { question: "Who holds the private keys?", answer: "You do. We design the custody model with you, including cold storage and multi-approval procedures, and never retain access to production keys after handover." },
    ],
  },
  {
    slug: "smart-contracts-wallets",
    title: "Smart Contracts & Wallets",
    icon: "wallet",
    shortDescription: "Tested, review-ready smart contracts, tokens and custodial or non-custodial wallets for public and private chains.",
    overview: `<p>Smart contracts are unforgiving: once deployed, a bug can be permanent and expensive. We design contracts that are simple, well-tested and built on established libraries, then pair them with the wallets and off-chain services that make them usable.</p>
<p>Every contract goes through unit, fuzz and integration testing and an internal security review against known vulnerability classes. For contracts that will hold significant value we recommend, and help coordinate, an independent third-party audit before mainnet deployment.</p>`,
    deliverables: [
      "Smart contract design, development and testing (EVM chains)",
      "Token design and issuance: fungible, NFT, utility and asset-backed",
      "Custodial and non-custodial wallets (web, mobile, browser extension)",
      "Multi-signature and MPC-ready custody workflows",
      "dApp front-ends, indexers and blockchain data services",
      "Upgrade strategy, deployment scripts and verified source code",
    ],
    techStack: ["Solidity", "Ethereum", "Polygon", "BNB Chain", "Arbitrum", "Hardhat", "Foundry", "OpenZeppelin", "ethers.js", "viem", "IPFS"],
    process: [
      { title: "Discover", description: "Assess whether blockchain is the right tool, which chain fits, and the legal considerations." },
      { title: "Design", description: "Specify contract behaviour, roles, upgrade strategy and token economics." },
      { title: "Build", description: "Contracts built on audited libraries with extensive automated tests." },
      { title: "Secure", description: "Internal review, static analysis and coordination with an external auditor." },
      { title: "Launch", description: "Testnet trials, mainnet deployment, verified source and on-chain monitoring." },
    ],
    faqs: [
      { question: "Which blockchains do you work with?", answer: "Primarily Ethereum and EVM-compatible networks such as Polygon, BNB Chain, Arbitrum and Base, plus Hyperledger Fabric for permissioned networks." },
      { question: "Do you audit smart contracts?", answer: "We perform thorough internal security reviews and testing. For contracts that will hold significant value, we strongly recommend, and help coordinate, an independent third-party audit." },
      { question: "Is tokenisation legal in India?", answer: "The regulatory position depends on the asset and structure. We work alongside your legal advisers; we do not provide legal advice." },
      { question: "Can you integrate a wallet into our existing app?", answer: "Yes. We can embed wallet functionality into existing web and mobile apps through SDKs and secure key-management services." },
    ],
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    icon: "shield",
    shortDescription: "Security audits, VAPT and secure architecture reviews that find real risks and explain exactly how to fix them.",
    overview: `<p>Attackers look for the weakest point in your applications, cloud configuration or processes. Our security team looks first, then gives you a clear, prioritised report your developers can act on.</p>
<p>We perform vulnerability assessment and penetration testing (VAPT) of web and mobile applications, APIs, networks and cloud environments, following recognised methodologies such as the OWASP Testing Guide and OWASP MASVS. We review source code, smart contracts and system architectures, and help you prepare for ISO/IEC 27001, SOC 2, the DPDP Act 2023 and CERT-In directions.</p>`,
    deliverables: [
      "Web, API and mobile application penetration testing (VAPT)",
      "Network and cloud configuration reviews (AWS, Azure, GCP)",
      "Secure architecture and threat-modelling workshops",
      "Secure source-code and smart-contract reviews",
      "Compliance-readiness assessments (ISO 27001, SOC 2, DPDP Act, CERT-In)",
      "Risk-rated report with remediation steps, plus a re-test of fixed findings",
    ],
    techStack: ["Burp Suite", "OWASP ZAP", "Nmap", "Metasploit", "MobSF", "Semgrep", "Trivy", "ScoutSuite", "Slither"],
    process: [
      { title: "Discover", description: "Agree targets, rules of engagement and timing, with written authorisation before any testing." },
      { title: "Design", description: "Map the attack surface and plan test cases for your roles, integrations and data flows." },
      { title: "Build", description: "Automated scanning plus manual testing for business-logic and authorisation flaws that tools miss." },
      { title: "Secure", description: "Risk-rated findings with evidence, business impact and practical remediation guidance." },
      { title: "Launch", description: "Verify fixes and issue a closure report you can share with stakeholders." },
    ],
    faqs: [
      { question: "Will testing disrupt our live systems?", answer: "We agree rules of engagement in advance and can test staging environments or schedule tests outside business hours to minimise risk." },
      { question: "Are you CERT-In empanelled?", answer: "[PLACEHOLDER: update with current empanelment / certification status before publishing.] If you need a CERT-In empanelled auditor for regulatory purposes, please tell us during scoping." },
      { question: "How long does a VAPT take?", answer: "A typical web application assessment takes one to three weeks depending on size and complexity, including reporting." },
      { question: "Do you keep our findings confidential?", answer: "Yes. All findings are confidential, shared only with your nominated contacts, and handled under NDA." },
    ],
  },
  {
    slug: "fintech-platforms",
    title: "Fintech Platforms",
    icon: "landmark",
    shortDescription: "Payments, lending, wealth and digital-asset platforms built with the security, audit trails and integrations regulated finance needs.",
    overview: `<p>Financial software has to be correct, auditable and secure from the first line of code. We build fintech products for start-ups, NBFCs, brokers and enterprises: payment and payout systems, lending and loan-management platforms, investment dashboards and digital-asset services.</p>
<p>Our builds include double-entry ledgers, maker-checker approvals, immutable audit logs, role-based access and reconciliation from day one, and integrate with Indian banking rails (UPI, NEFT/IMPS through partner banks), KYC providers (Aadhaar e-KYC, Video KYC, CKYC) and account aggregators. We design to the requirements your compliance team and advisers set, so audits are straightforward.</p>`,
    deliverables: [
      "Payment, payout and wallet systems with double-entry ledgers",
      "Lending, loan-origination and collection platforms",
      "Investment, brokerage and portfolio dashboards",
      "KYC, e-sign and account-aggregator integrations",
      "Maker-checker workflows, audit trails and regulatory reports",
      "Reconciliation engines and finance-team back offices",
    ],
    techStack: ["Java", "Go", "Node.js", "TypeScript", "React", "Flutter", "PostgreSQL", "Kafka", "Redis", "Kubernetes", "AWS"],
    process: [
      { title: "Discover", description: "Product, money flows, partners and the regulatory obligations that shape the design." },
      { title: "Design", description: "Ledger model, security architecture, integrations and a clickable prototype." },
      { title: "Build", description: "Iterative delivery with automated tests on every money-moving path." },
      { title: "Secure", description: "Penetration testing, reconciliation drills and an audit-trail review before go-live." },
      { title: "Launch", description: "Phased roll-out, monitoring, and support for audits and certifications." },
    ],
    faqs: [
      { question: "Do you work with RBI-regulated entities?", answer: "We build technology for regulated businesses and design to the requirements set by your compliance team and advisers. Regulatory approvals remain the responsibility of the licensed entity." },
      { question: "Can you integrate UPI and bank APIs?", answer: "Yes, through your sponsor or partner bank and licensed payment aggregators, using their sandbox and production APIs." },
      { question: "Where is data hosted?", answer: "Payment data can be hosted entirely in India (for example AWS Mumbai) to meet data-localisation requirements." },
      { question: "Can you take over an existing fintech codebase?", answer: "Yes. We start with a code and security review, then stabilise and extend the platform." },
    ],
  },
];
