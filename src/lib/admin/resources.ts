/**
 * Declarative definitions of every content type managed in Admin → Content.
 * Shared by the generic list/edit UI (client) and the generic API (server), so
 * validation and forms always stay in sync.
 */
export type FieldType =
  | "text" | "textarea" | "richtext" | "slug" | "number" | "boolean" | "select"
  | "multiselect" | "image" | "datetime" | "list" | "steps" | "faqs" | "tags" | "category" | "url";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  help?: string;
  options?: { value: string; label: string }[];
  group?: "main" | "seo" | "side";
};

export type Resource = {
  key: string;
  model: "page" | "service" | "caseStudy" | "blogPost" | "blogCategory" | "teamMember" | "job" | "testimonial" | "faq";
  label: string;
  singular: string;
  permission: "content.manage" | "careers.manage";
  titleField: string;
  listColumns: { name: string; label: string; kind?: "bool" | "date" | "status" }[];
  searchFields: string[];
  orderBy: Record<string, "asc" | "desc">[];
  fields: Field[];
  publicPath?: (r: Record<string, unknown>) => string | null;
  canCreate?: boolean;
  canDelete?: boolean;
};

const SERVICE_OPTIONS = [
  ["software-development", "Software Development"],
  ["web-development", "Web Development"],
  ["mobile-app-development", "Mobile App Development"],
  ["blockchain-solutions", "Blockchain Solutions"],
  ["crypto-exchange-development", "Crypto Exchange Platform Development"],
  ["ai-integration", "AI Integration"],
  ["cybersecurity-audit", "Cybersecurity Audit"],
  ["data-analytics", "Data Analytics"],
].map(([value, label]) => ({ value, label }));

export const SEO_FIELDS: Field[] = [
  { name: "seoTitle", label: "Meta title", type: "text", max: 70, help: "Shown in search results. Aim for 50–60 characters.", group: "seo" },
  { name: "seoDescription", label: "Meta description", type: "textarea", max: 170, help: "Aim for 140–160 characters.", group: "seo" },
  { name: "ogImage", label: "Open Graph image", type: "image", help: "1200 × 630 px recommended. Used when shared on social media.", group: "seo" },
  { name: "canonicalUrl", label: "Canonical URL", type: "url", help: "Leave blank to use this page’s own URL.", group: "seo" },
  { name: "noindex", label: "Hide from search engines (noindex)", type: "boolean", group: "seo" },
];

export const RESOURCES: Resource[] = [
  {
    key: "pages",
    model: "page",
    label: "Pages",
    singular: "Page",
    permission: "content.manage",
    titleField: "title",
    listColumns: [{ name: "title", label: "Title" }, { name: "slug", label: "URL" }, { name: "noindex", label: "Noindex", kind: "bool" }, { name: "updatedAt", label: "Updated", kind: "date" }],
    searchFields: ["title", "slug"],
    orderBy: [{ slug: "asc" }],
    canCreate: false,
    canDelete: false,
    publicPath: (r) => (r.slug === "home" ? "/" : r.slug === "ns-exchange" ? "/products/ns-exchange" : `/${r.slug}`),
    fields: [
      { name: "title", label: "Page heading", type: "text", required: true, max: 200 },
      { name: "intro", label: "Introduction", type: "textarea", max: 600, help: "Shown under the heading." },
      { name: "body", label: "Body", type: "richtext", help: "Only used on About and legal pages. Other pages are laid out in code; edit their heading, intro and SEO here." },
      ...SEO_FIELDS,
    ],
  },
  {
    key: "services",
    model: "service",
    label: "Services",
    singular: "Service",
    permission: "content.manage",
    titleField: "title",
    listColumns: [{ name: "title", label: "Title" }, { name: "published", label: "Published", kind: "bool" }, { name: "order", label: "Order" }],
    searchFields: ["title", "slug"],
    orderBy: [{ order: "asc" }],
    publicPath: (r) => `/services/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 120 },
      { name: "slug", label: "URL slug", type: "slug", required: true },
      { name: "shortDescription", label: "One-line description", type: "textarea", required: true, max: 300 },
      {
        name: "icon", label: "Icon", type: "select", required: true,
        options: ["code", "globe", "smartphone", "blocks", "exchange", "bot", "shield", "chart"].map((v) => ({ value: v, label: v })),
        group: "side",
      },
      { name: "overview", label: "Overview", type: "richtext", required: true },
      { name: "deliverables", label: "What we deliver", type: "list", help: "One item per line." },
      { name: "techStack", label: "Technology stack", type: "list", help: "One technology per line." },
      { name: "process", label: "Process steps", type: "steps" },
      { name: "faqs", label: "FAQs", type: "faqs" },
      { name: "order", label: "Display order", type: "number", group: "side" },
      { name: "published", label: "Published", type: "boolean", group: "side" },
      { name: "featured", label: "Featured", type: "boolean", group: "side" },
      ...SEO_FIELDS,
    ],
  },
  {
    key: "portfolio",
    model: "caseStudy",
    label: "Portfolio / Case studies",
    singular: "Case study",
    permission: "content.manage",
    titleField: "title",
    listColumns: [{ name: "title", label: "Title" }, { name: "industry", label: "Industry" }, { name: "isPlaceholder", label: "Placeholder", kind: "bool" }, { name: "published", label: "Published", kind: "bool" }],
    searchFields: ["title", "client", "industry"],
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    publicPath: (r) => `/portfolio/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 200 },
      { name: "slug", label: "URL slug", type: "slug", required: true },
      { name: "client", label: "Client name", type: "text", max: 150, help: "Only with the client’s written permission." },
      { name: "industry", label: "Industry", type: "text", max: 100 },
      { name: "summary", label: "Summary", type: "textarea", required: true, max: 500 },
      { name: "challenge", label: "The challenge", type: "textarea", max: 3000 },
      { name: "solution", label: "Our solution", type: "textarea", max: 3000 },
      { name: "results", label: "Results", type: "textarea", max: 3000, help: "Use only real, verifiable outcomes." },
      { name: "body", label: "Additional content", type: "richtext" },
      { name: "services", label: "Services", type: "multiselect", options: SERVICE_OPTIONS },
      { name: "coverImage", label: "Cover image", type: "image", group: "side" },
      { name: "order", label: "Display order", type: "number", group: "side" },
      { name: "isPlaceholder", label: "Placeholder content", type: "boolean", group: "side", help: "Untick once the content is real." },
      { name: "published", label: "Published", type: "boolean", group: "side" },
      ...SEO_FIELDS,
    ],
  },
  {
    key: "blog",
    model: "blogPost",
    label: "Blog posts",
    singular: "Post",
    permission: "content.manage",
    titleField: "title",
    listColumns: [{ name: "title", label: "Title" }, { name: "status", label: "Status", kind: "status" }, { name: "publishedAt", label: "Publish date", kind: "date" }],
    searchFields: ["title", "excerpt"],
    orderBy: [{ updatedAt: "desc" }],
    publicPath: (r) => (r.status === "DRAFT" ? null : `/blog/${r.slug}`),
    fields: [
      { name: "title", label: "Title", type: "text", required: true, max: 200 },
      { name: "slug", label: "URL slug", type: "slug", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true, max: 400 },
      { name: "body", label: "Article", type: "richtext", required: true },
      {
        name: "status", label: "Status", type: "select", required: true, group: "side",
        options: [{ value: "DRAFT", label: "Draft" }, { value: "SCHEDULED", label: "Scheduled" }, { value: "PUBLISHED", label: "Published" }],
      },
      { name: "publishedAt", label: "Publish date / time", type: "datetime", group: "side", help: "For scheduled posts, the post goes live automatically at this time (your local time zone)." },
      { name: "categoryId", label: "Category", type: "category", group: "side" },
      { name: "tags", label: "Tags", type: "tags", group: "side", help: "Comma-separated." },
      { name: "authorName", label: "Author name", type: "text", max: 100, group: "side" },
      { name: "coverImage", label: "Cover image", type: "image", group: "side" },
      ...SEO_FIELDS,
    ],
  },
  {
    key: "categories",
    model: "blogCategory",
    label: "Blog categories",
    singular: "Category",
    permission: "content.manage",
    titleField: "name",
    listColumns: [{ name: "name", label: "Name" }, { name: "slug", label: "Slug" }],
    searchFields: ["name"],
    orderBy: [{ name: "asc" }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 80 },
      { name: "slug", label: "Slug", type: "slug", required: true },
    ],
  },
  {
    key: "team",
    model: "teamMember",
    label: "Team members",
    singular: "Team member",
    permission: "content.manage",
    titleField: "name",
    listColumns: [{ name: "name", label: "Name" }, { name: "designation", label: "Designation" }, { name: "isPlaceholder", label: "Placeholder", kind: "bool" }, { name: "published", label: "Published", kind: "bool" }],
    searchFields: ["name", "designation"],
    orderBy: [{ order: "asc" }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, max: 100 },
      { name: "designation", label: "Designation", type: "text", required: true, max: 100 },
      { name: "bio", label: "Short bio", type: "textarea", max: 600 },
      { name: "linkedin", label: "LinkedIn URL", type: "url" },
      { name: "photo", label: "Photo", type: "image", group: "side" },
      { name: "order", label: "Display order", type: "number", group: "side" },
      { name: "isPlaceholder", label: "Placeholder content", type: "boolean", group: "side" },
      { name: "published", label: "Published", type: "boolean", group: "side" },
    ],
  },
  {
    key: "jobs",
    model: "job",
    label: "Careers – jobs",
    singular: "Job",
    permission: "careers.manage",
    titleField: "title",
    listColumns: [{ name: "title", label: "Title" }, { name: "department", label: "Department" }, { name: "published", label: "Published", kind: "bool" }, { name: "closesAt", label: "Closes", kind: "date" }],
    searchFields: ["title", "department"],
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    publicPath: (r) => (r.published ? `/careers/${r.slug}` : null),
    fields: [
      { name: "title", label: "Job title", type: "text", required: true, max: 150 },
      { name: "slug", label: "URL slug", type: "slug", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true, max: 400 },
      { name: "description", label: "Description", type: "richtext", required: true },
      { name: "department", label: "Department", type: "text", required: true, max: 80, group: "side" },
      { name: "location", label: "Location", type: "text", required: true, max: 120, group: "side" },
      { name: "employmentType", label: "Employment type", type: "select", required: true, group: "side", options: ["Full-time", "Part-time", "Contract", "Internship"].map((v) => ({ value: v, label: v })) },
      { name: "experience", label: "Experience", type: "text", max: 60, group: "side" },
      { name: "closesAt", label: "Closing date", type: "datetime", group: "side" },
      { name: "order", label: "Display order", type: "number", group: "side" },
      { name: "published", label: "Published", type: "boolean", group: "side" },
    ],
  },
  {
    key: "testimonials",
    model: "testimonial",
    label: "Testimonials",
    singular: "Testimonial",
    permission: "content.manage",
    titleField: "name",
    listColumns: [{ name: "name", label: "Client" }, { name: "company", label: "Company" }, { name: "approved", label: "Approved", kind: "bool" }, { name: "permissionOnFile", label: "Permission", kind: "bool" }],
    searchFields: ["name", "company", "quote"],
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    fields: [
      { name: "name", label: "Client name", type: "text", required: true, max: 100 },
      { name: "designation", label: "Designation", type: "text", max: 100 },
      { name: "company", label: "Company", type: "text", max: 150 },
      { name: "quote", label: "Testimonial (verbatim)", type: "textarea", required: true, max: 1200, help: "Enter the client’s exact words. Never write or edit testimonials on a client’s behalf." },
      { name: "rating", label: "Rating (1–5, optional)", type: "number", group: "side" },
      { name: "order", label: "Display order", type: "number", group: "side" },
      { name: "permissionOnFile", label: "Written permission to publish is on file", type: "boolean", group: "side" },
      { name: "approved", label: "Approved (show on website)", type: "boolean", group: "side", help: "Shown only when both Approved and Permission are ticked." },
    ],
  },
  {
    key: "faqs",
    model: "faq",
    label: "FAQs",
    singular: "FAQ",
    permission: "content.manage",
    titleField: "question",
    listColumns: [{ name: "question", label: "Question" }, { name: "category", label: "Category" }, { name: "published", label: "Published", kind: "bool" }],
    searchFields: ["question", "answer"],
    orderBy: [{ category: "asc" }, { order: "asc" }],
    fields: [
      { name: "question", label: "Question", type: "text", required: true, max: 250 },
      { name: "answer", label: "Answer", type: "textarea", required: true, max: 2000 },
      {
        name: "category", label: "Shown on", type: "select", required: true, group: "side",
        options: [{ value: "general", label: "General" }, { value: "process", label: "Our Process page" }, { value: "ns-exchange", label: "NS Exchange page" }, { value: "careers", label: "Careers" }],
      },
      { name: "order", label: "Display order", type: "number", group: "side" },
      { name: "published", label: "Published", type: "boolean", group: "side" },
    ],
  },
];

export function getResource(key: string) {
  return RESOURCES.find((r) => r.key === key) ?? null;
}
