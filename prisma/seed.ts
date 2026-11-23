/* eslint-disable no-console */
// Seeds placeholder content only. Safe to re-run: existing records are not overwritten
// (pass SEED_OVERWRITE=true to refresh services and pages from the seed files).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { PAGES } from "./seed-data/pages";
import { SERVICES } from "./seed-data/services";

const prisma = new PrismaClient();
const overwrite = process.env.SEED_OVERWRITE === "true";

const FAQS = [
  { category: "general", question: "Where is Nuvsera Technology based?", answer: "Our office is at 706, 7th Floor, OM Tower, 32 Chowringhee Road, Park Street, Kolkata – 700071. We work with clients across India and internationally." },
  { category: "general", question: "How quickly will you respond to my enquiry?", answer: "We reply to every enquiry within one business day." },
  { category: "process", question: "Do you work on fixed-price or time-and-materials?", answer: "Both. Well-defined projects are usually fixed-price with milestone payments; evolving products often suit a monthly time-and-materials or dedicated-team model." },
  { category: "process", question: "How will we know how the project is going?", answer: "You get a named project lead, a shared project board, a written weekly update and a live demo at the end of every two-week sprint." },
  { category: "process", question: "What happens after launch?", answer: "Every release includes a warranty period for defects. After that, you can choose a monthly support plan covering monitoring, updates and improvements." },
  { category: "process", question: "Who owns the code?", answer: "You do. Full ownership of custom deliverables transfers to you on final payment." },
  { category: "ns-exchange", question: "What is NS Exchange?", answer: "NS Exchange is the crypto exchange platform of the Nuvsera Technology group, offering spot and P2P trading with secure wallet infrastructure." },
  { category: "ns-exchange", question: "Can I license the NS Exchange technology for my business?", answer: "Yes. Through our Crypto Exchange Platform Development service we adapt the platform to your brand, markets and compliance requirements." },
  { category: "ns-exchange", question: "Does the platform support KYC and AML?", answer: "Yes. Onboarding integrates with KYC providers, and the platform includes transaction-monitoring hooks, record-keeping and reporting tools. Operators remain responsible for their own regulatory compliance." },
];

async function main() {
  // Settings (defaults are applied in code; store an empty object so admins can edit).
  await prisma.setting.upsert({ where: { key: "site" }, create: { key: "site", value: {} }, update: {} });

  for (const p of PAGES) {
    await prisma.page.upsert({ where: { slug: p.slug }, create: p, update: overwrite ? p : {} });
  }
  for (const [i, s] of SERVICES.entries()) {
    const data = { ...s, order: i, featured: !!s.featured, published: true };
    await prisma.service.upsert({ where: { slug: s.slug }, create: data, update: overwrite ? data : {} });
  }
  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({ data: FAQS.map((f, i) => ({ ...f, order: i })) });
  }

  // Blog taxonomy + one DRAFT example post (never published automatically).
  const cats = [
    ["Software Engineering", "software-engineering"],
    ["Blockchain", "blockchain"],
    ["Cybersecurity", "cybersecurity"],
    ["AI & Data", "ai-data"],
    ["Company News", "company-news"],
  ];
  for (const [name, slug] of cats) await prisma.blogCategory.upsert({ where: { slug }, create: { name, slug }, update: {} });
  if ((await prisma.blogPost.count()) === 0) {
    const cat = await prisma.blogCategory.findUnique({ where: { slug: "cybersecurity" } });
    await prisma.blogPost.create({
      data: {
        slug: "example-draft-post",
        title: "[PLACEHOLDER] Example draft article",
        excerpt: "This draft shows the blog format. Replace it with a real article before publishing.",
        body: "<p>This is a placeholder draft. Write your article here using the rich-text editor, choose a category and tags, and either publish now or schedule it for later.</p>",
        status: "DRAFT",
        categoryId: cat?.id,
        tags: { connectOrCreate: [{ where: { slug: "security" }, create: { name: "Security", slug: "security" } }] },
      },
    });
  }

  // Placeholders — unpublished until replaced with real, approved content.
  if ((await prisma.caseStudy.count()) === 0) {
    await prisma.caseStudy.createMany({
      data: [
        {
          slug: "placeholder-erp-modernisation",
          title: "[PLACEHOLDER] ERP modernisation for a manufacturer",
          industry: "Manufacturing",
          summary: "Placeholder case study. Replace with a real, client-approved project.",
          challenge: "[Describe the client’s problem]",
          solution: "[Describe what you built and how]",
          results: "[Describe measurable, verifiable outcomes — do not invent figures]",
          services: ["software-development", "data-analytics"],
          isPlaceholder: true,
          published: false,
        },
        {
          slug: "placeholder-security-assessment",
          title: "[PLACEHOLDER] Security assessment for a fintech platform",
          industry: "Financial services",
          summary: "Placeholder case study. Replace with a real, client-approved project.",
          challenge: "[Describe the client’s problem]",
          solution: "[Describe your approach]",
          results: "[Describe outcomes with the client’s permission]",
          services: ["cybersecurity-audit"],
          isPlaceholder: true,
          published: false,
        },
      ],
    });
  }
  if ((await prisma.teamMember.count()) === 0) {
    await prisma.teamMember.createMany({
      data: [
        { name: "[PLACEHOLDER] Director name", designation: "Director", bio: "[Short professional bio]", isPlaceholder: true, published: false, order: 0 },
        { name: "[PLACEHOLDER] Director name", designation: "Director", bio: "[Short professional bio]", isPlaceholder: true, published: false, order: 1 },
      ],
    });
  }
  if ((await prisma.job.count()) === 0) {
    await prisma.job.create({
      data: {
        slug: "placeholder-full-stack-developer",
        title: "[PLACEHOLDER] Full-Stack Developer",
        department: "Engineering",
        experience: "2–5 years",
        summary: "Placeholder job. Edit the details and publish when the role is open.",
        description: "<h2>About the role</h2><p>[Describe the role]</p><h2>Responsibilities</h2><ul><li>[Responsibility]</li></ul><h2>Requirements</h2><ul><li>[Requirement]</li></ul>",
        published: false,
      },
    });
  }

  // First Super Admin. Must change password and enrol 2FA on first login.
  if ((await prisma.user.count()) === 0) {
    const email = (process.env.SEED_ADMIN_EMAIL || "admin@nuvseratechnology.com").toLowerCase();
    const generated = !process.env.SEED_ADMIN_PASSWORD;
    const password = process.env.SEED_ADMIN_PASSWORD || `Nv-${randomBytes(12).toString("base64url")}!9`;
    await prisma.user.create({
      data: { name: "Super Admin", email, role: "SUPER_ADMIN", passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true },
    });
    console.log(`\n✔ Created Super Admin: ${email}`);
    if (generated) console.log(`  Temporary password (shown once): ${password}`);
    console.log("  You will be asked to change the password and set up 2FA on first login.\n");
  }
  console.log("✔ Seed complete (placeholder content only).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
