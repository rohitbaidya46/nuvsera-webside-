/* eslint-disable no-console */
// Seeds placeholder content only. Safe to re-run: existing records are not overwritten
// (pass SEED_OVERWRITE=true to refresh services and pages from the seed files).
// Load .env when run from the command line (existing environment variables take precedence).
try {
  process.loadEnvFile();
} catch {
  /* no .env file — rely on the environment */
}
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { PAGES } from "./seed-data/pages";
import { SERVICES } from "./seed-data/services";
import { LEGACY_SERVICE_REDIRECTS } from "../src/lib/constants";

const prisma = new PrismaClient();
const overwrite = process.env.SEED_OVERWRITE === "true";

const FAQS = [
  { category: "general", question: "Where is Nuvsera Technology based?", answer: "Our office is at 706, 7th Floor, OM Tower, 32 Chowringhee Road, Park Street, Kolkata – 700071. We work with clients across India and internationally." },
  { category: "general", question: "How quickly will you respond to my enquiry?", answer: "We reply to every enquiry within one business day." },
  { category: "process", question: "Do you work on fixed-price or time-and-materials?", answer: "Both. Well-defined projects are usually fixed-price with milestone payments; evolving products often suit a monthly time-and-materials or dedicated-team model." },
  { category: "process", question: "How will we know how the project is going?", answer: "You get a named project lead, a shared project board, a written weekly update and a live demo at the end of every two-week sprint." },
  { category: "process", question: "What happens after launch?", answer: "Every release includes a warranty period for defects. After that, you can choose a monthly support plan covering monitoring, updates and improvements." },
  { category: "process", question: "Who owns the code?", answer: "You do. Full ownership of custom deliverables transfers to you on final payment." },
  { category: "ns-exchange", question: "What is NS Exchange?", answer: "NS Exchange (nsexchange.com) is a crypto exchange built and owned by Nuvsera Technology, offering spot and P2P trading with secure wallet infrastructure." },
  { category: "ns-exchange", question: "Can I license the NS Exchange technology for my business?", answer: "Yes. Through our Blockchain & Crypto Exchange Development service we adapt the platform to your brand, markets and compliance requirements." },
  { category: "ns-exchange", question: "Does the platform support KYC and AML?", answer: "Yes. Onboarding integrates with KYC providers, and the platform includes transaction-monitoring hooks, record-keeping and reporting tools. Operators remain responsible for their own regulatory compliance." },
];

// The retired company number is identified only by its SHA-256 (digits with country code), so the number
// itself never appears anywhere in the codebase.
const OLD_PHONE_SHA256 = "2fa4d414a92ae48fadd037c05a3c26c45aa5578ccb36117a46ba271cca9ff1c4";
const NEW_PHONE = "+91 97343 33355";
const NEW_WHATSAPP = "919734333355";
const PHONE_LIKE = /\+?\d[\d\s-]{8,16}\d/g;

/** Replaces every occurrence of the retired phone number (any formatting) with the current one. */
function replaceOldPhone(text: string) {
  return text.replace(PHONE_LIKE, (m) => {
    let digits = m.replace(/\D/g, "");
    if (digits.length === 10) digits = `91${digits}`;
    if (createHash("sha256").update(digits).digest("hex") !== OLD_PHONE_SHA256) return m;
    return /^\d+$/.test(m) ? NEW_WHATSAPP : NEW_PHONE;
  });
}

/** One-off data fixes for databases seeded by earlier versions. Each runs once and is recorded in Setting "migrations". */
async function dataMigrations() {
  const row = await prisma.setting.findUnique({ where: { key: "migrations" } });
  const done = new Set<string>(Array.isArray(row?.value) ? (row!.value as string[]) : []);
  const mark = (id: string) => done.add(id);

  // The old company phone number must not appear anywhere: settings, page bodies, FAQs, services.
  // Runs on every seed (cheap and idempotent) so a pasted-back old number is always corrected.
  const site = await prisma.setting.findUnique({ where: { key: "site" } });
  if (site?.value && typeof site.value === "object") {
    const v = site.value as Record<string, Record<string, unknown>>;
    const text = JSON.stringify(v);
    const fixedText = replaceOldPhone(text);
    if (fixedText !== text) {
      await prisma.setting.update({ where: { key: "site" }, data: { value: JSON.parse(fixedText) } });
      console.log("✔ Replaced the old phone number in site settings");
    }
  }
  for (const p of await prisma.page.findMany({ select: { id: true, body: true, intro: true, seoDescription: true } })) {
    const fields = { body: p.body, intro: p.intro, seoDescription: p.seoDescription };
    const data: Record<string, string> = {};
    for (const [k, val] of Object.entries(fields)) if (val && replaceOldPhone(val) !== val) data[k] = replaceOldPhone(val);
    if (Object.keys(data).length) {
      await prisma.page.update({ where: { id: p.id }, data });
      console.log(`✔ Replaced the old phone number on page ${p.id}`);
    }
  }
  for (const f of await prisma.faq.findMany({ select: { id: true, answer: true } })) {
    const answer = replaceOldPhone(f.answer);
    if (answer !== f.answer) await prisma.faq.update({ where: { id: f.id }, data: { answer } });
  }

  // v2 service structure: five services replace the original eight. Old pages are unpublished (not deleted)
  // and their URLs redirect permanently to the closest new service.
  if (!done.has("services-v2")) {
    const legacy = Object.keys(LEGACY_SERVICE_REDIRECTS);
    const r = await prisma.service.updateMany({ where: { slug: { in: legacy } }, data: { published: false, order: { increment: 100 } } });
    for (const cs of await prisma.caseStudy.findMany({ select: { id: true, services: true } })) {
      const mapped = [...new Set(cs.services.map((s) => LEGACY_SERVICE_REDIRECTS[s] ?? s))];
      if (mapped.join() !== cs.services.join()) await prisma.caseStudy.update({ where: { id: cs.id }, data: { services: mapped } });
    }
    if (r.count) console.log(`✔ Unpublished ${r.count} legacy services (their URLs now redirect to the new services)`);
    mark("services-v2");
  }

  await prisma.setting.upsert({ where: { key: "migrations" }, create: { key: "migrations", value: [...done] }, update: { value: [...done] } });
}

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
  await dataMigrations();
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
