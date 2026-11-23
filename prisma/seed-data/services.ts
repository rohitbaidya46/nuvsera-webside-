// Original copy for the eight service pages. Editable afterwards in Admin → Content → Services.

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
    slug: "software-development",
    title: "Software Development",
    icon: "code",
    shortDescription: "Custom business applications and ERP solutions shaped around the way your organisation actually works.",
    overview: `<p>Off-the-shelf software forces you to adapt your business to someone else’s assumptions. Custom software does the opposite: it encodes your processes, approvals and reporting exactly as you run them — and it grows with you.</p>
<p>We design and build line-of-business applications, ERP modules, internal tools and integrations for manufacturers, distributors, service firms and start-ups. Our focus is software that your team actually enjoys using, that integrates cleanly with the systems you already have (Tally, SAP, Zoho, payment gateways, government portals) and that is documented well enough for any competent team to maintain.</p>
<h3>When custom software makes sense</h3>
<ul><li>Spreadsheets and manual hand-offs are slowing your team down or causing errors.</li><li>Your current system cannot be configured to fit a core process.</li><li>You need to connect several tools into one reliable workflow.</li><li>You are building a software product to sell to your own customers.</li></ul>`,
    deliverables: [
      "Custom ERP and operations modules (inventory, procurement, production, HR, finance)",
      "Workflow and approval automation",
      "Role-based dashboards and reporting",
      "Integrations with Tally, SAP, Zoho, GST and payment APIs",
      "SaaS products with multi-tenant architecture",
      "Legacy system modernisation and data migration",
    ],
    techStack: ["TypeScript", "Node.js", "NestJS", "Python", "Django", ".NET", "React", "PostgreSQL", "Redis", "Docker", "AWS"],
    process: [
      { title: "Process mapping", description: "We sit with the people who do the work and map current processes, pain points and the data that flows between them." },
      { title: "Solution design", description: "Architecture, data model and clickable prototypes so you can validate the solution before development begins." },
      { title: "Iterative build", description: "Two-week sprints with working software demonstrated at the end of each sprint." },
      { title: "Migration & training", description: "Clean migration of existing data, user training and written guides for every role." },
      { title: "Go-live & care", description: "A supported go-live, a warranty period and optional monthly maintenance." },
    ],
    faqs: [
      { question: "How much does custom software cost?", answer: "It depends on scope. After a short discovery call we provide an itemised, milestone-based estimate. Small internal tools may start from a few lakh rupees; larger ERP programmes are phased so you see value early." },
      { question: "Will we own the source code?", answer: "Yes. On final payment, full ownership of the source code, documentation and deployment configuration transfers to you, as set out in our Terms & Conditions." },
      { question: "Can you work with our existing ERP?", answer: "Yes. We frequently extend or integrate with existing systems through their APIs or data exports rather than replacing them outright." },
      { question: "Do you sign an NDA?", answer: "Yes — we are happy to sign a mutual NDA before you share any confidential information." },
    ],
  },
  {
    slug: "web-development",
    title: "Web Development",
    icon: "globe",
    shortDescription: "Fast, accessible corporate websites, e-commerce stores and customer portals that turn visitors into customers.",
    overview: `<p>Your website is often the first serious impression a customer has of your business. We build websites and web applications that load quickly, rank well, work for every visitor — including people using screen readers or slow mobile connections — and are easy for your own team to update.</p>
<p>From a polished corporate site to a full e-commerce platform or a secure customer portal, we combine thoughtful design, clean engineering and measurable outcomes: performance budgets, Core Web Vitals, accessibility to WCAG 2.1 AA and analytics that respect your visitors’ privacy choices.</p>`,
    deliverables: [
      "Corporate and brand websites with an easy-to-use CMS",
      "E-commerce stores with Indian payment gateways (UPI, cards, net banking)",
      "Customer, partner and vendor portals",
      "Progressive web apps (PWA)",
      "Technical SEO, Core Web Vitals and accessibility audits",
      "Hosting, monitoring and ongoing maintenance",
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Headless CMS", "Shopify", "WooCommerce", "PostgreSQL", "Vercel", "AWS"],
    process: [
      { title: "Goals & content", description: "Define audiences, key actions and the content each page needs to do its job." },
      { title: "UX & visual design", description: "Wireframes and high-fidelity designs for desktop and mobile, reviewed with you." },
      { title: "Development", description: "Component-based build with performance and accessibility checks in continuous integration." },
      { title: "Content & SEO", description: "Content migration, metadata, structured data, redirects and analytics set-up." },
      { title: "Launch & optimise", description: "Go-live, monitoring and data-driven improvements after launch." },
    ],
    faqs: [
      { question: "Can we edit the website ourselves?", answer: "Yes. Every site includes an admin panel or CMS so your team can update text, images, blog posts and SEO settings without a developer." },
      { question: "Which payment gateways do you integrate?", answer: "We regularly integrate Razorpay, PayU, Cashfree, CCAvenue, Stripe and PayPal, including UPI and international cards." },
      { question: "How long does a website take?", answer: "A typical corporate website takes four to eight weeks from approved content. E-commerce and portals usually take longer, depending on integrations." },
      { question: "Will the site be mobile-friendly and accessible?", answer: "Always. We design mobile-first and test against WCAG 2.1 AA, with automated and manual accessibility checks." },
    ],
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    icon: "smartphone",
    shortDescription: "Native-quality Android and iOS apps — built cross-platform or fully native — from idea to app-store launch.",
    overview: `<p>Great mobile apps feel effortless: they start instantly, work offline when they need to, and respect the user’s time, battery and privacy. We design and build Android and iOS apps for consumer products, field teams and businesses that need a reliable mobile channel.</p>
<p>We recommend the right approach for your goals — Flutter or React Native for a single shared codebase, or fully native Kotlin and Swift where performance or platform features demand it — and we handle everything through to Google Play and App Store submission.</p>`,
    deliverables: [
      "Android and iOS apps (cross-platform or native)",
      "UX/UI design following Material and Human Interface guidelines",
      "Secure APIs and admin back-ends",
      "Offline sync, push notifications and in-app payments",
      "App-store submission, listing optimisation and release management",
      "Crash monitoring, analytics and ongoing updates",
    ],
    techStack: ["Flutter", "React Native", "Kotlin", "Swift", "Firebase", "Node.js", "GraphQL", "PostgreSQL", "Fastlane"],
    process: [
      { title: "Product discovery", description: "Clarify users, core journeys and the minimum feature set for a strong first release." },
      { title: "Design & prototype", description: "Interactive prototypes tested with real users before development." },
      { title: "Build & integrate", description: "App and back-end development in sprints, with test builds shared every sprint." },
      { title: "QA on real devices", description: "Testing across a matrix of Android and iOS devices, screen sizes and OS versions." },
      { title: "Launch & grow", description: "Store submission, monitoring and a roadmap of improvements informed by usage data." },
    ],
    faqs: [
      { question: "Should we build native or cross-platform?", answer: "For most business and consumer apps, Flutter or React Native delivers near-native quality at lower cost. We recommend native when an app relies heavily on platform-specific features or demanding graphics." },
      { question: "Do you publish the app to the stores?", answer: "Yes. We prepare store listings and handle submission — under your own developer accounts, so you retain full ownership." },
      { question: "Can you take over an existing app?", answer: "Yes. We start with a code and security review, then propose a stabilisation plan before adding new features." },
      { question: "What about maintenance after launch?", answer: "OS updates arrive every year. Our support plans cover compatibility updates, bug fixes and small improvements." },
    ],
  },
  {
    slug: "blockchain-solutions",
    title: "Blockchain Solutions",
    icon: "blocks",
    shortDescription: "Audited smart contracts, secure wallets and asset tokenisation for businesses building on public or private chains.",
    overview: `<p>Blockchain is a powerful tool for specific problems: shared records between parties who do not fully trust each other, programmable assets, transparent audit trails and settlement without intermediaries. We help you identify where it genuinely adds value — and build it properly when it does.</p>
<p>Our engineers design and implement smart contracts, wallets, token systems and the off-chain services that make them usable. Security comes first: every contract is developed with established libraries, extensive tests and an internal review, and we recommend an independent third-party audit before mainnet deployment.</p>`,
    deliverables: [
      "Smart contract design, development and testing (EVM and other chains)",
      "Custodial and non-custodial wallet development",
      "Token design and issuance (fungible, NFT, utility and asset-backed)",
      "Asset tokenisation platforms",
      "Private / permissioned ledger solutions",
      "dApp front-ends and blockchain indexing services",
    ],
    techStack: ["Solidity", "Ethereum", "Polygon", "BNB Chain", "Hardhat", "Foundry", "OpenZeppelin", "ethers.js", "Hyperledger Fabric", "IPFS", "Node.js"],
    process: [
      { title: "Feasibility", description: "Assess whether blockchain is the right tool, which chain fits, and the legal and regulatory considerations." },
      { title: "Token & contract design", description: "Specify contract behaviour, roles, upgrade strategy and economic model." },
      { title: "Development & testing", description: "Contracts built on audited libraries with unit, fuzz and integration tests." },
      { title: "Security review", description: "Internal review against known vulnerability classes, plus coordination with an external auditor." },
      { title: "Deployment & monitoring", description: "Testnet trials, mainnet deployment, verified source and on-chain monitoring." },
    ],
    faqs: [
      { question: "Which blockchains do you work with?", answer: "Primarily Ethereum and EVM-compatible networks such as Polygon, BNB Chain, Arbitrum and Base, as well as Hyperledger Fabric for permissioned networks." },
      { question: "Do you audit smart contracts?", answer: "We perform thorough internal security reviews and testing. For contracts that will hold significant value, we strongly recommend — and help coordinate — an independent third-party audit." },
      { question: "Is tokenisation legal in India?", answer: "The regulatory position depends on the asset and structure. We work alongside your legal advisers and design systems that can accommodate compliance requirements; we do not provide legal advice." },
      { question: "Can you integrate blockchain with our existing systems?", answer: "Yes. Most real-world solutions combine on-chain contracts with conventional databases, APIs and user interfaces." },
    ],
  },
  {
    slug: "crypto-exchange-development",
    title: "Crypto Exchange Platform Development",
    icon: "exchange",
    featured: true,
    shortDescription: "Spot and P2P exchange platforms with secure wallets, a full admin console and KYC/AML-ready workflows — the technology behind NS Exchange.",
    overview: `<p>Launching a digital-asset exchange means getting dozens of difficult things right at once: a fast and fair matching engine, wallet security, KYC and AML workflows, reconciliation, customer support and an operator console your compliance team can trust. We have done this for our own group company, <a href="/products/ns-exchange">NS Exchange</a>, and we bring that experience to your platform.</p>
<p>We deliver white-label and custom exchanges, deployed to your own infrastructure, with your branding, markets and fee structures. Compliance-related features are built to work with your chosen KYC providers and your legal advisers’ requirements, including record-keeping and reporting that may be needed for registration with regulators such as FIU-IND.</p>`,
    deliverables: [
      "Spot exchange with order book and high-performance matching engine",
      "P2P trading marketplace with escrow and dispute management",
      "Hot / warm / cold wallet architecture with multi-approval withdrawals",
      "KYC/AML-ready onboarding and transaction-monitoring hooks",
      "Operator admin: markets, fees, users, reconciliation, reports and audit logs",
      "Web and mobile trading apps, public APIs and market-maker integration",
    ],
    techStack: ["Go", "Node.js", "TypeScript", "React", "Flutter", "PostgreSQL", "Redis", "Kafka", "Kubernetes", "Solidity", "AWS"],
    process: [
      { title: "Business & compliance scoping", description: "Markets, revenue model, jurisdictions, KYC providers and compliance obligations — with your advisers." },
      { title: "Architecture & security design", description: "Matching engine, wallet custody model, threat model and infrastructure plan." },
      { title: "Platform build", description: "Core exchange, wallets, admin console and apps, demonstrated sprint by sprint." },
      { title: "Security testing", description: "Penetration testing, load testing and wallet procedure rehearsals before launch." },
      { title: "Launch & operations support", description: "Phased launch, 24×7 monitoring options and ongoing feature development." },
    ],
    faqs: [
      { question: "Is this the same technology as NS Exchange?", answer: "Yes. Our exchange development practice builds on the platform and experience behind NS Exchange, adapted to each client’s requirements." },
      { question: "Do you help with regulatory registration?", answer: "We build the technical capabilities typically needed for compliance — KYC, record-keeping, reporting and audit trails — and work with your legal advisers. Registration itself, such as with FIU-IND, remains the operator’s responsibility." },
      { question: "How long does it take to launch an exchange?", answer: "A white-label launch with standard features can take a few months; fully custom platforms take longer. We provide a detailed plan after discovery." },
      { question: "Who holds the private keys?", answer: "You do. We design the custody model with you — including cold storage and multi-approval procedures — and never retain access to production keys after handover." },
    ],
  },
  {
    slug: "ai-integration",
    title: "AI Integration",
    icon: "bot",
    shortDescription: "Practical AI: chatbots, document automation and intelligent features added safely to your existing business apps.",
    overview: `<p>AI is most valuable when it removes repetitive work or helps people make better decisions inside tools they already use. We help businesses move from experimentation to dependable production features — with clear measures of accuracy, cost and risk.</p>
<p>Typical projects include customer-support assistants grounded in your own knowledge base, document and invoice extraction, email triage, sales-lead scoring and natural-language search across company data. We put guard-rails first: data privacy, human review where it matters, evaluation before launch and monitoring after it.</p>`,
    deliverables: [
      "Customer-support and internal knowledge chatbots (RAG)",
      "Document, invoice and form data extraction",
      "Workflow automation with AI agents and human approval steps",
      "AI features inside existing web and mobile apps",
      "Model evaluation, prompt engineering and cost optimisation",
      "Data-privacy reviews and AI usage policies",
    ],
    techStack: ["Python", "TypeScript", "LLM APIs", "LangChain", "Vector databases", "PostgreSQL + pgvector", "FastAPI", "TensorFlow", "PyTorch"],
    process: [
      { title: "Use-case selection", description: "Identify high-value, low-risk opportunities and define how success will be measured." },
      { title: "Data readiness", description: "Review data sources, quality, access permissions and privacy requirements." },
      { title: "Prototype & evaluate", description: "Build a working prototype and test it against real examples before committing." },
      { title: "Production integration", description: "Integrate into your systems with logging, guard-rails, fall-backs and human review." },
      { title: "Monitor & improve", description: "Track accuracy, usage and cost; refine prompts, data and models over time." },
    ],
    faqs: [
      { question: "Will our data be used to train public AI models?", answer: "Not by us. We select providers and configurations that do not use your data for training, and we can deploy models in your own cloud where required." },
      { question: "How accurate will the AI be?", answer: "We measure accuracy on your own examples during the prototype stage and agree acceptable thresholds before production. Where errors are costly, we keep a human in the loop." },
      { question: "Can AI integrate with our CRM or ERP?", answer: "Yes. Most of our AI work involves connecting models to existing systems through their APIs." },
      { question: "What does it cost to run?", answer: "Running costs depend on usage volume and model choice. We estimate them during the prototype and design for cost efficiency." },
    ],
  },
  {
    slug: "cybersecurity-audit",
    title: "Cybersecurity Audit",
    icon: "shield",
    shortDescription: "VAPT, secure code reviews and compliance-readiness assessments that find real risks and explain how to fix them.",
    overview: `<p>Attackers look for the weakest point in your applications, cloud configuration or processes. Our security team looks first — then gives you a clear, prioritised report your developers can act on.</p>
<p>We perform vulnerability assessment and penetration testing (VAPT) of web and mobile applications, APIs, networks and cloud environments, following recognised methodologies such as the OWASP Testing Guide and OWASP MASVS. We also review source code, smart contracts and architectures, and help you prepare for frameworks and requirements such as ISO/IEC 27001, SOC 2, the DPDP Act 2023 and CERT-In directions.</p>`,
    deliverables: [
      "Web, API and mobile application penetration testing",
      "Network and cloud configuration reviews (AWS, Azure, GCP)",
      "Secure source-code and smart-contract reviews",
      "Compliance-readiness assessments (ISO 27001, SOC 2, DPDP Act)",
      "Executive summary plus detailed technical findings with remediation steps",
      "Free re-test of fixed findings within the agreed window",
    ],
    techStack: ["Burp Suite", "OWASP ZAP", "Nmap", "Metasploit", "MobSF", "Semgrep", "Trivy", "ScoutSuite", "Slither"],
    process: [
      { title: "Scoping & authorisation", description: "Agree targets, rules of engagement and timing, with written authorisation before any testing." },
      { title: "Reconnaissance", description: "Map the attack surface: endpoints, roles, integrations and technologies." },
      { title: "Testing", description: "Automated scanning plus manual testing for business-logic and authorisation flaws that tools miss." },
      { title: "Reporting", description: "Risk-rated findings with evidence, business impact and practical remediation guidance." },
      { title: "Re-test & close-out", description: "Verify fixes and issue a closure report you can share with stakeholders." },
    ],
    faqs: [
      { question: "Will testing disrupt our live systems?", answer: "We agree rules of engagement in advance and can test staging environments or schedule tests outside business hours to minimise risk." },
      { question: "Are you CERT-In empanelled?", answer: "[PLACEHOLDER — update with current empanelment / certification status before publishing.] If you require a CERT-In empanelled auditor for regulatory purposes, please tell us during scoping." },
      { question: "How long does a VAPT take?", answer: "A typical web application assessment takes one to three weeks depending on size and complexity, including reporting." },
      { question: "Do you keep our findings confidential?", answer: "Yes. All findings are confidential, shared only with your nominated contacts, and handled under NDA." },
    ],
  },
  {
    slug: "data-analytics",
    title: "Data Analytics",
    icon: "chart",
    shortDescription: "Dashboards, automated reporting and business intelligence that turn scattered data into decisions.",
    overview: `<p>Most organisations already have the data they need — spread across spreadsheets, accounting software, CRMs and operational systems. We bring it together into a reliable single source of truth and present it in dashboards that leaders actually use.</p>
<p>We design data pipelines and warehouses, define the metrics that matter with your team, and build dashboards and automated reports with clear ownership and governance. The result: less time compiling reports, more time acting on them.</p>`,
    deliverables: [
      "KPI definition workshops and metric dictionaries",
      "Data pipelines (ETL/ELT) from ERP, CRM, accounting and web sources",
      "Cloud data warehouse design and implementation",
      "Interactive dashboards and self-service BI",
      "Automated scheduled reports via email and WhatsApp",
      "Data quality checks, governance and access controls",
    ],
    techStack: ["Python", "SQL", "dbt", "Apache Airflow", "PostgreSQL", "BigQuery", "Power BI", "Metabase", "Apache Superset", "Pandas"],
    process: [
      { title: "Questions first", description: "Agree the business questions and decisions the data must support." },
      { title: "Data audit", description: "Inventory sources, assess quality and design the target data model." },
      { title: "Pipelines & warehouse", description: "Build tested, scheduled pipelines into a central warehouse." },
      { title: "Dashboards", description: "Design and build dashboards with your users, iterating on real data." },
      { title: "Adoption & governance", description: "Training, documentation, data ownership and ongoing support." },
    ],
    faqs: [
      { question: "Which BI tool should we use?", answer: "It depends on your budget, existing licences and users. We work with Power BI, Metabase, Superset, Looker Studio and others, and will recommend the best fit." },
      { question: "Can you connect to Tally or our ERP?", answer: "Yes. We regularly extract data from Tally, Zoho, SAP and custom systems through APIs, connectors or scheduled exports." },
      { question: "Is our data secure?", answer: "Data stays in infrastructure you control, with role-based access and encryption. We follow least-privilege principles throughout." },
      { question: "How soon will we see results?", answer: "Most clients see a first useful dashboard within a few weeks, with further reports added iteratively." },
    ],
  },
];
