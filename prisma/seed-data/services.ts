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
  {
    slug: "coin-listing",
    title: "Coin Listing",
    icon: "listing",
    shortDescription: "Exchange-ready token preparation and listing support: technical integration, documentation and due-diligence packs, including listing on NS Exchange.",
    overview: `<p>Getting a coin or token listed is as much about preparation as it is about code. Exchanges and data aggregators ask for a working, verified contract, clear tokenomics, legal and KYC documents, liquidity plans and reliable technical integration. We prepare all of it with you, so your application is complete the first time.</p>
<p>For <a href="https://nsexchange.com" rel="noopener">NS Exchange</a>, the exchange built and owned by Nuvsera, we handle the full technical integration: deposits and withdrawals, wallet and node set-up, market creation and monitoring. For other exchanges and aggregators we prepare the technical and documentation pack and support you through their process.</p>
<h3>Important</h3>
<p>Every exchange makes its own independent listing decision after its own due diligence. We do not and cannot guarantee a listing, a price or trading volume. Listing on NS Exchange is also subject to NS Exchange’s due-diligence and compliance review.</p>`,
    deliverables: [
      "Listing-readiness review of your token, contract and documentation",
      "Verified contract source and token metadata on block explorers",
      "Exchange integration: deposit/withdrawal, node and wallet set-up",
      "Listing application pack: technical sheet, tokenomics, team and legal documents",
      "Listing support for NS Exchange, subject to its due diligence",
      "Post-listing monitoring of deposits, withdrawals and market health",
    ],
    techStack: ["Solidity", "EVM chains", "BNB Chain", "Polygon", "Tron (TRC-20)", "Node operations", "Etherscan / BscScan verification", "REST & WebSocket APIs"],
    process: [
      { title: "Discover", description: "Review the token, contract, chain, supply and target exchanges." },
      { title: "Design", description: "Close the gaps: verification, metadata, documentation and liquidity plan." },
      { title: "Build", description: "Technical integration with the exchange: nodes, wallets and confirmations." },
      { title: "Secure", description: "Contract and integration checks before deposits are opened." },
      { title: "Launch", description: "Market opening on the exchange and post-listing monitoring." },
    ],
    faqs: [
      { question: "Can you guarantee a listing?", answer: "No. Every exchange, including NS Exchange, makes its own listing decision after due diligence. We prepare a complete, technically sound application and handle integration once a listing is approved." },
      { question: "Which chains do you support?", answer: "Ethereum and EVM-compatible chains such as BNB Chain, Polygon, Arbitrum and Base, and TRC-20 tokens on Tron. Ask us about others." },
      { question: "Do I need an audit before listing?", answer: "Most reputable exchanges expect a security review of the token contract. We recommend our Coin Audit or Smart Contract Audit service before applying." },
      { question: "Do you provide market making or liquidity?", answer: "No. We can integrate with your chosen market-making partner’s APIs, but we do not provide liquidity or trade on your behalf." },
    ],
  },
  {
    slug: "coin-audit",
    title: "Coin Audit",
    icon: "scan",
    shortDescription: "Independent review of a coin or token: contract security, ownership and admin powers, supply and tokenomics, and on-chain holder concentration.",
    overview: `<p>Before you list, invest in or integrate a token, you need to know what its contract can actually do. Our Coin Audit looks beyond the whitepaper at the deployed contract and its on-chain reality.</p>
<p>We check the contract for known vulnerability classes and for powers that put holders at risk: minting, pausing, blacklisting, fee changes, upgradeability and who controls them. We compare the stated tokenomics with the actual supply, vesting and holder distribution on-chain, and deliver a clear, risk-rated report with recommendations.</p>
<p>Send us the <strong>contract address and blockchain</strong> using the audit request form on this page to receive a scope and quote.</p>`,
    deliverables: [
      "Contract security review against known vulnerability classes",
      "Owner/admin powers analysis: mint, pause, blacklist, fees, upgrades",
      "Tokenomics check: stated vs on-chain supply, vesting and locks",
      "Holder concentration and liquidity-lock review",
      "Risk-rated report with clear recommendations",
      "Re-check after fixes and a shareable summary",
    ],
    techStack: ["Solidity", "Slither", "Foundry", "Mythril", "Etherscan / BscScan", "Dune / on-chain analytics", "EVM chains", "Tron"],
    process: [
      { title: "Discover", description: "Share the contract address, chain and whitepaper; we agree scope and timeline." },
      { title: "Design", description: "Map the contract’s roles, privileged functions and token flows." },
      { title: "Build", description: "Automated analysis plus manual line-by-line review and on-chain checks." },
      { title: "Secure", description: "Risk-rated findings with evidence and recommended fixes." },
      { title: "Launch", description: "Re-check after fixes and a final report you can share." },
    ],
    faqs: [
      { question: "What do I need to send?", answer: "The contract address and the blockchain it is deployed on, plus your whitepaper or tokenomics if available. Verified source code on the explorer speeds things up." },
      { question: "Is an audit a guarantee that a token is safe?", answer: "No audit can guarantee the absence of all issues. The report describes what we reviewed, what we found and the residual risks, as of the audited version." },
      { question: "How long does it take?", answer: "A typical single-token audit takes three to seven working days depending on contract size and complexity." },
      { question: "Can we publish the report?", answer: "Yes, once fixes are verified you may publish the final report or its summary." },
    ],
  },
  {
    slug: "smart-contract-audit",
    title: "Smart Contract Audit",
    icon: "filecode",
    shortDescription: "Line-by-line security audit of smart contracts by address or repository: vulnerabilities, access control, upgrade safety and gas, with a re-test of fixes.",
    overview: `<p>Smart contracts hold real value and cannot easily be changed once deployed. Our audits combine automated analysis with careful manual review by engineers who build contracts themselves, including for <a href="https://nsexchange.com" rel="noopener">NS Exchange</a>.</p>
<p>We audit contracts already deployed (send us the <strong>contract address and chain</strong>) or code before deployment (share the repository and commit). The review covers reentrancy, access control, oracle and price manipulation, upgradeability and storage layout, signature handling, integer and rounding issues, and gas efficiency.</p>
<p>You receive a risk-rated report with proof-of-concept tests for significant findings, then a free re-test once you have fixed them.</p>`,
    deliverables: [
      "Manual line-by-line review plus static and fuzz analysis",
      "Access control, upgradeability and storage-layout review",
      "Oracle, price-manipulation and economic attack review",
      "Proof-of-concept tests for significant findings",
      "Risk-rated report with remediation guidance",
      "Free re-test of fixed findings and a final report",
    ],
    techStack: ["Solidity", "Vyper", "Foundry", "Hardhat", "Slither", "Echidna", "Mythril", "OpenZeppelin", "EVM chains"],
    process: [
      { title: "Discover", description: "Contract address and chain, or repository and commit; we agree scope and timeline." },
      { title: "Design", description: "Threat model: roles, assets, trust assumptions and external dependencies." },
      { title: "Build", description: "Manual review, automated analysis, fuzzing and proof-of-concept tests." },
      { title: "Secure", description: "Report with severity-rated findings and recommended fixes." },
      { title: "Launch", description: "Re-test of fixes and a final report ready to publish." },
    ],
    faqs: [
      { question: "Can you audit a contract that is already deployed?", answer: "Yes. Send us the contract address and the chain. Verified source code on the block explorer is needed; if it is not verified, share the source and we will confirm it matches the deployed bytecode." },
      { question: "Which languages and chains?", answer: "Solidity and Vyper on Ethereum and EVM-compatible chains (BNB Chain, Polygon, Arbitrum, Base and others)." },
      { question: "Is an audit a guarantee?", answer: "No. An audit reduces risk significantly but cannot prove the absence of all bugs. We recommend audits before every major release and monitoring after deployment." },
      { question: "How is pricing decided?", answer: "By contract size and complexity (lines of code, external integrations, upgradeability). You receive a fixed quote after scoping." },
    ],
  },
];
