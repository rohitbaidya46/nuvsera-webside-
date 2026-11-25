// Original page copy. Legal texts are a professionally drafted starting point —
// have them reviewed by your legal counsel before go-live (see docs/ADMIN_GUIDE.md).

const CO = "Nuvsera Technology Private Limited";
const ADDR = "706, 7th Floor, OM Tower, 32 Chowringhee Road, Park Street, Kolkata – 700071, West Bengal, India";
const EMAIL = "info@nuvseratechnology.com";
const SUPPORT = "support@nuvseratechnology.com";
const PHONE = "+91 97343 33355";

export const PAGES: { slug: string; title: string; intro?: string; body?: string; isSystem: boolean; seoTitle?: string; seoDescription?: string }[] = [
  { slug: "home", title: "Home", isSystem: true },
  { slug: "services", title: "Engineering services built around your business", isSystem: true },
  { slug: "ns-exchange", title: "NS Exchange", isSystem: true },
  { slug: "portfolio", title: "Our work", isSystem: true },
  { slug: "process", title: "A transparent process, from first call to long-term support", isSystem: true },
  { slug: "careers", title: "Build what matters, with people who care how it is built", isSystem: true },
  { slug: "blog", title: "Insights from our engineers", isSystem: true },
  { slug: "contact", title: "Let’s talk about your project", isSystem: true },
  { slug: "get-a-quote", title: "Get a free, itemised quote", isSystem: true },
  {
    slug: "about",
    title: "Engineering trust into every product we build",
    intro: "Nuvsera Technology is a Kolkata-based technology company building custom software, blockchain platforms and security solutions — and the company that built and owns the NS Exchange crypto exchange.",
    isSystem: false,
    body: `<h2>Who we are</h2>
<p>${CO} was incorporated in 2025 in Kolkata, West Bengal, with a simple belief: businesses deserve technology partners who are as careful with their systems as they are ambitious about what those systems can do.</p>
<p>We bring together software engineers, blockchain specialists, designers and security practitioners under one roof. That combination matters. A modern product is rarely “just” an app — it is an app, an API, a cloud environment, a data pipeline and, increasingly, an AI feature or a ledger. We design all of those parts to work together, and we secure them from the first line of code.</p>
<h2>What we do</h2>
<p>We work across five practices: custom software and web/mobile apps, blockchain and crypto exchange development, smart contracts and wallets, cybersecurity, and fintech platforms. Clients engage us for a single project, an ongoing product team, or an independent review of systems built by others.</p>
<h2>NS Exchange</h2>
<p>We built and own <a href="https://nsexchange.com" rel="noopener">NS Exchange</a>, a digital-asset exchange platform. Running a platform that handles real users and real assets keeps our standards high — the same practices we use there shape every client engagement.</p>
<h2>How we work</h2>
<ul>
<li><strong>Clarity before code.</strong> Every engagement starts with a written scope, itemised pricing and agreed milestones.</li>
<li><strong>Visible progress.</strong> Two-week sprints, demos and a shared project board.</li>
<li><strong>Security by design.</strong> Threat modelling, code review and testing are part of the plan, not an afterthought.</li>
<li><strong>Your IP, your accounts.</strong> Code, designs and cloud accounts belong to you.</li>
</ul>
<h2>Where we are</h2>
<p>Our office is at ${ADDR}. We work with clients across India and internationally, on-site in Kolkata or remotely.</p>`,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    intro: `How ${CO} collects, uses, shares and protects your personal data.`,
    isSystem: false,
    body: `<p>This Privacy Policy explains how ${CO} (“<strong>Nuvsera</strong>”, “<strong>we</strong>”, “<strong>us</strong>”) processes digital personal data when you visit nuvseratechnology.com (the “<strong>Website</strong>”), contact us, apply for a job or use our services. We act as a <strong>Data Fiduciary</strong> under the Digital Personal Data Protection Act, 2023 (“<strong>DPDP Act</strong>”) and the rules made under it.</p>

<h2>1. Who we are</h2>
<p>${CO}, CIN U62013WB2025PTC283873, registered office: ${ADDR}. Contact: <a href="mailto:${EMAIL}">${EMAIL}</a>, ${PHONE}.</p>

<h2>2. Personal data we collect</h2>
<ul>
<li><strong>Enquiry and quote forms:</strong> name, company, email address, phone number, the service you are interested in, budget range, timeline, your message and any file you choose to attach.</li>
<li><strong>Job applications:</strong> name, contact details, location, experience, profile links, cover letter and CV.</li>
<li><strong>Newsletter:</strong> email address and your subscription preferences.</li>
<li><strong>Attribution data (when you submit a form):</strong> the page you were on, the page you first landed on, the referring website, campaign (UTM) parameters and advertising click identifiers (for example Google or LinkedIn click IDs).</li>
<li><strong>Technical data:</strong> a keyed (one-way) hash of your IP address, browser type and security logs. We do not store your raw IP address with form submissions.</li>
<li><strong>Cookies and similar technologies:</strong> see section 9.</li>
</ul>
<p>We do not knowingly collect sensitive data such as financial account details or health information through the Website. Please do not include such data in free-text fields or attachments.</p>

<h2>3. Why we use your data</h2>
<table><thead><tr><th>Purpose</th><th>Basis</th></tr></thead><tbody>
<tr><td>Responding to your enquiry or quote request, and following up about it</td><td>Your consent, given on the form</td></tr>
<tr><td>Assessing job applications</td><td>Your consent, given on the application form</td></tr>
<tr><td>Sending our newsletter</td><td>Your consent (confirmed by email)</td></tr>
<tr><td>Understanding which pages and campaigns generate enquiries</td><td>Your consent (analytics and marketing cookies)</td></tr>
<tr><td>Keeping the Website and our systems secure, preventing spam and fraud</td><td>Legitimate uses permitted under the DPDP Act</td></tr>
<tr><td>Delivering contracted services, invoicing and meeting legal obligations (for example tax records)</td><td>Performance of contract and compliance with law</td></tr>
</tbody></table>

<h2>4. Sharing your data</h2>
<p>We do not sell personal data. We share it only with service providers (“Data Processors”) who help us operate — for example cloud hosting, email delivery, spam protection (hCaptcha) and, where you have consented, analytics and advertising providers (Google, LinkedIn) — under contracts that require them to protect it. We may also disclose data where required by law or to protect our legal rights.</p>

<h2>5. Transfers outside India</h2>
<p>Some service providers may process data outside India. Any such transfer is made in accordance with the DPDP Act and any restrictions notified by the Government of India.</p>

<h2>6. How long we keep data</h2>
<ul>
<li>Enquiries that do not become projects: up to 24 months after our last contact, then deleted or anonymised.</li>
<li>Client project and billing records: as long as required by applicable tax and company laws (generally 8 years).</li>
<li>Job applications: up to 12 months, unless you ask us to delete them sooner or you join us.</li>
<li>Newsletter: until you unsubscribe.</li>
<li>Consent records: for as long as needed to demonstrate consent.</li>
</ul>

<h2>7. Your rights</h2>
<p>As a Data Principal under the DPDP Act you have the right to:</p>
<ul>
<li>obtain a summary of your personal data we process and the processing activities;</li>
<li>correct, complete, update or erase your personal data;</li>
<li>withdraw consent at any time — as easily as you gave it (withdrawal does not affect processing done before it);</li>
<li>have a readily available means of grievance redressal; and</li>
<li>nominate another person to exercise your rights in the event of death or incapacity.</li>
</ul>
<p>To exercise any right, email <a href="mailto:${EMAIL}">${EMAIL}</a> with the subject “Data request”. We will respond within the period prescribed under the DPDP Act and its rules.</p>

<h2>8. Grievance Officer</h2>
<p>[PLACEHOLDER — Name of Grievance Officer], ${CO}, ${ADDR}. Email: <a href="mailto:${SUPPORT}">${SUPPORT}</a> (subject “Grievance”) · Phone ${PHONE}. We acknowledge grievances within 48 hours and resolve them within the period prescribed under the DPDP Act and its rules. If you are not satisfied with our response, you may complain to the Data Protection Board of India.</p>

<h2 id="cookies">9. Cookies</h2>
<p>We use three categories of cookies:</p>
<ul>
<li><strong>Strictly necessary</strong> — required for security and to remember your cookie choice. These are always on.</li>
<li><strong>Analytics</strong> — Google Analytics 4, with IP anonymisation, to understand how the Website is used. Loaded only if you consent.</li>
<li><strong>Marketing</strong> — Google Ads conversion tracking and the LinkedIn Insight Tag, to measure the effectiveness of our advertising. Loaded only if you consent.</li>
</ul>
<p>Separately, we count page views and daily unique visitors without cookies: we store only the page address and a hash that changes every day and cannot identify you. Do-Not-Track and Global Privacy Control signals are honoured. See our <a href="/cookie-policy">Cookie Policy</a> for the full list.</p>
<p>You can change or withdraw your choice at any time using “Cookie settings” in the footer of every page.</p>

<h2>10. Security</h2>
<p>We protect personal data with reasonable security safeguards including encryption in transit (HTTPS), access controls with two-factor authentication for staff, audit logging, data minimisation and regular backups. If a personal data breach occurs, we will notify affected Data Principals and the Data Protection Board as required by law.</p>

<h2>11. Children</h2>
<p>The Website is not directed at children under 18. We do not knowingly process children’s personal data without verifiable consent of a parent or lawful guardian.</p>

<h2>12. Changes</h2>
<p>We may update this policy from time to time. The “Last updated” date at the top of this page shows when it was last revised. Material changes will be highlighted on the Website.</p>`,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    intro: "The terms that apply to your use of this website and to services provided by Nuvsera Technology, including our payment and project-delivery policy.",
    isSystem: false,
    body: `<p>These Terms &amp; Conditions (“<strong>Terms</strong>”) govern your use of nuvseratechnology.com and the services provided by ${CO} (“<strong>Nuvsera</strong>”, “<strong>we</strong>”). Where we sign a proposal, Statement of Work (“<strong>SOW</strong>”) or master services agreement with you, that document prevails over these Terms to the extent of any conflict.</p>

<h2>1. Use of the website</h2>
<ul>
<li>Content on this Website is for general information only and does not constitute a binding offer.</li>
<li>You must not misuse the Website, including attempting unauthorised access, introducing malware, scraping at scale or submitting false information.</li>
<li>All Website content, design and trademarks belong to Nuvsera or its licensors. Third-party product names and logos belong to their owners.</li>
</ul>

<h2>2. Quotes and proposals</h2>
<ul>
<li>Quotes are valid for 30 days unless stated otherwise.</li>
<li>Every proposal lists scope, deliverables, milestones, timeline, price and assumptions. Work outside that scope is a change request (section 5).</li>
<li>A project begins when the SOW is accepted in writing (including by email) and the advance payment is received.</li>
</ul>

<h2>3. Payment policy</h2>
<ul>
<li><strong>Currency and taxes.</strong> Prices are in Indian Rupees (INR) unless stated otherwise. GST at the applicable rate is charged in addition and shown separately on every tax invoice (GSTIN 19AAKCN9781A1Z2).</li>
<li><strong>Milestone schedule.</strong> Unless your SOW specifies otherwise, fixed-price projects are billed: <strong>40%</strong> advance on signing; <strong>30%</strong> on approval of the design / mid-project milestone; and <strong>30%</strong> on delivery for user-acceptance testing.</li>
<li><strong>Time-and-materials and retainers</strong> are invoiced monthly in advance (retainers) or monthly in arrears (time-and-materials), based on agreed rates.</li>
<li><strong>Due date.</strong> Invoices are payable within 7 days of issue by bank transfer (NEFT/RTGS/IMPS), UPI or another method we agree.</li>
<li><strong>TDS.</strong> Where you deduct tax at source, please share the TDS certificate within the statutory period.</li>
<li><strong>Late payment.</strong> If an invoice is unpaid 15 days after its due date, we may pause work after written notice, and timelines will be extended accordingly. Interest may be charged at 1.5% per month on overdue amounts.</li>
<li><strong>Third-party costs</strong> (domain names, hosting, software licences, app-store fees, paid APIs) are payable by you, directly to the provider where possible, or reimbursed at cost.</li>
</ul>

<h2>4. Project-delivery policy</h2>
<ul>
<li><strong>Timelines.</strong> Delivery dates in the SOW are our good-faith estimates based on the agreed scope and on receiving your inputs (content, feedback, access, approvals) on time. Delays in inputs extend the timeline correspondingly.</li>
<li><strong>Communication.</strong> We provide a named project lead, a shared project board, and a demo at the end of each sprint or milestone.</li>
<li><strong>Delivery.</strong> Deliverables are provided through a staging environment, repository access or file transfer as agreed.</li>
<li><strong>Acceptance.</strong> You have <strong>7 business days</strong> from delivery of a milestone to test it and report defects against the agreed scope. A milestone is deemed accepted when you approve it, start using it in production, or the acceptance period ends without a written defect report.</li>
<li><strong>Defects vs. changes.</strong> We fix defects (deviations from the agreed specification) at no charge. New or changed requirements are change requests.</li>
<li><strong>Warranty.</strong> After final acceptance, we fix defects reported within <strong>30 days</strong> at no charge (longer if your SOW says so). The warranty does not cover issues caused by changes made by others, third-party services or hosting outside our control.</li>
<li><strong>Handover.</strong> On final payment we hand over source code, documentation and credentials for all accounts created for the project.</li>
</ul>

<h2>5. Change requests</h2>
<p>Either party may propose a change. We will estimate its impact on cost and timeline in writing; it is implemented only after your written approval.</p>

<h2>6. Intellectual property</h2>
<ul>
<li>On receipt of full payment, all rights in the custom deliverables created specifically for you transfer to you.</li>
<li>We retain ownership of our pre-existing tools, libraries and know-how, and grant you a perpetual, non-exclusive, royalty-free licence to use them as part of the deliverables.</li>
<li>Open-source components remain subject to their own licences, which we will identify.</li>
<li>Unless you object in writing, we may list your company name as a client. We publish case studies or testimonials only with your written permission.</li>
</ul>

<h2>7. Confidentiality and data protection</h2>
<p>Each party will keep the other’s confidential information secret and use it only for the project. Where we process personal data on your behalf, we do so only on your documented instructions and with appropriate security safeguards, consistent with the Digital Personal Data Protection Act, 2023.</p>

<h2>8. Your responsibilities</h2>
<p>You are responsible for the legality of the content, data and business model the deliverables support — including obtaining any licences or registrations required to operate them (for example, registrations required for operating a virtual digital asset exchange).</p>

<h2>9. Limitation of liability</h2>
<p>To the maximum extent permitted by law, neither party is liable for indirect or consequential losses, loss of profit or loss of data, and our total liability arising from a project is limited to the fees paid to us for that project in the 12 months preceding the claim. Nothing limits liability that cannot be limited by law.</p>

<h2>10. Termination</h2>
<p>Either party may terminate a project for material breach that is not remedied within 15 days of written notice. Cancellation by you is governed by our <a href="/refund-and-cancellation-policy">Refund &amp; Cancellation Policy</a>.</p>

<h2>11. Governing law and disputes</h2>
<p>These Terms are governed by the laws of India. The parties will first try to resolve disputes amicably within 30 days. Failing that, disputes will be referred to arbitration by a sole arbitrator under the Arbitration and Conciliation Act, 1996, seated in Kolkata, in English. Subject to this, the courts at Kolkata, West Bengal have exclusive jurisdiction.</p>

<h2>12. Contact</h2>
<p>${CO}, ${ADDR}. Email <a href="mailto:${EMAIL}">${EMAIL}</a> · Phone ${PHONE}.</p>`,
  },
  {
    slug: "refund-and-cancellation-policy",
    title: "Refund & Cancellation Policy",
    intro: "Clear, fair rules for cancelling a project or plan, and how refunds are handled.",
    isSystem: false,
    body: `<p>This policy applies to services purchased from ${CO}. If your signed SOW or agreement contains different terms, those terms apply.</p>

<h2>1. Cancelling a project</h2>
<ul>
<li><strong>Before work starts</strong> (before the kick-off meeting): you may cancel by written notice and we will refund 100% of the advance, less any third-party costs already incurred on your behalf.</li>
<li><strong>After work has started:</strong> you may cancel at any time by written notice. You pay for (a) all milestones already completed and (b) work performed on the current milestone up to the date of notice, calculated pro rata or at our standard time-and-materials rates, whichever is lower. Any amount you have paid above this will be refunded.</li>
<li>On cancellation we will deliver all completed and in-progress work you have paid for.</li>
</ul>

<h2>2. Cancellation by Nuvsera</h2>
<p>If we are unable to continue a project for reasons within our control, we will refund all amounts paid for work not yet delivered.</p>

<h2>3. Support plans and retainers</h2>
<ul>
<li>Monthly plans may be cancelled with 30 days’ written notice. Fees for the current billing month are not refundable.</li>
<li>Annual plans paid in advance may be cancelled with 30 days’ notice; unused full months after the notice period are refunded.</li>
</ul>

<h2>4. Cybersecurity assessments</h2>
<p>If you cancel or reschedule an agreed testing window with less than 5 business days’ notice, up to 25% of the assessment fee may be retained to cover reserved team time. Once testing has started, the fee is payable for work performed.</p>

<h2>5. Non-refundable items</h2>
<ul>
<li>Third-party costs: domain registrations, hosting, software licences, app-store fees, paid APIs and similar.</li>
<li>Milestones that have been accepted (see the acceptance terms in our <a href="/terms-and-conditions">Terms &amp; Conditions</a>).</li>
</ul>

<h2>6. How refunds are paid</h2>
<ul>
<li>Approved refunds are processed within <strong>7–10 business days</strong> to the original payment method or to the bank account from which payment was made.</li>
<li>Where GST was charged, we will issue a credit note in accordance with GST law.</li>
</ul>

<h2>7. How to request a cancellation or refund</h2>
<p>Email <a href="mailto:${EMAIL}">${EMAIL}</a> with your company name, project or invoice reference and the reason for your request. We will acknowledge it within 2 business days.</p>`,
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    intro: "Which cookies and similar technologies nuvseratechnology.com uses, why, and how you control them.",
    isSystem: false,
    seoTitle: "Cookie Policy | Nuvsera Technology",
    seoDescription: "How Nuvsera Technology uses strictly necessary, analytics and marketing cookies, and how to change your choice at any time.",
    body: `<p>This Cookie Policy explains how ${CO} uses cookies and similar technologies on nuvseratechnology.com. It should be read together with our <a href="/privacy-policy">Privacy Policy</a>.</p>

<h2>1. What cookies are</h2>
<p>Cookies are small text files stored by your browser. Similar technologies include local and session storage. Some are needed for the Website to work; others are optional and used only with your consent, in line with the Digital Personal Data Protection Act, 2023.</p>

<h2>2. Cookies we use</h2>
<table><thead><tr><th>Category</th><th>Name / provider</th><th>Purpose</th><th>Duration</th></tr></thead><tbody>
<tr><td>Strictly necessary</td><td><code>nv_consent</code> (Nuvsera)</td><td>Remembers your cookie choice</td><td>12 months</td></tr>
<tr><td>Strictly necessary</td><td><code>__Host-nv_admin</code> (Nuvsera, admin panel only)</td><td>Keeps staff signed in securely</td><td>Up to 12 hours</td></tr>
<tr><td>Strictly necessary</td><td>Session storage <code>nv_attr</code>, <code>nv_seen</code></td><td>Remembers how you arrived (sent only with a form or button click) and skips the intro animation on later pages</td><td>Until the tab is closed</td></tr>
<tr><td>Analytics (optional)</td><td>Google Analytics 4 (<code>_ga</code>, <code>_ga_*</code>)</td><td>Understand how the Website is used</td><td>Up to 13 months</td></tr>
<tr><td>Marketing (optional)</td><td>Google Ads, LinkedIn Insight Tag</td><td>Measure the effectiveness of our advertising</td><td>Up to 6 months</td></tr>
</tbody></table>
<p>Optional cookies are loaded <strong>only after you choose “Accept”</strong> in the cookie banner. Our own visitor statistics use no cookies at all: we count page views and daily unique visitors with a hash that changes every day, and we honour Do-Not-Track and Global Privacy Control.</p>

<h2>3. Changing your choice</h2>
<p>Use “Cookie settings” in the footer of any page to change or withdraw consent at any time. You can also delete cookies in your browser settings. Withdrawing consent does not affect processing that took place before.</p>

<h2>4. Contact</h2>
<p>Questions about this policy: <a href="mailto:${SUPPORT}">${SUPPORT}</a> · ${PHONE} · ${ADDR}.</p>`,
  },
];
