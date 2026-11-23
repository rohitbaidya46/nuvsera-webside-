import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { PageHeader } from "@/components/admin/ui";
import { delegate, toFormValues } from "@/lib/admin/resource-server";
import { getResource } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Edit" };

export default async function ResourceEdit({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const r = getResource(resource);
  if (!r) notFound();
  await requireAdmin(r.permission);
  const isNew = id === "new";
  if (isNew && r.canCreate === false) notFound();
  let initial: Record<string, unknown> = {};
  if (!isNew) {
    const rec = await delegate(r).findUnique({ where: { id }, ...(r.model === "blogPost" ? { include: { tags: true } } : {}) });
    if (!rec) notFound();
    initial = toFormValues(r, rec);
  } else {
    for (const f of r.fields) {
      if (f.type === "boolean") initial[f.name] = f.name === "published" && r.model === "service";
      else if (f.type === "select" && f.required) initial[f.name] = f.options?.[0]?.value ?? "";
      else if (["list", "multiselect", "steps", "faqs", "tags"].includes(f.type)) initial[f.name] = [];
      else if (f.name === "location") initial[f.name] = "Kolkata, West Bengal (On-site)";
      else initial[f.name] = "";
    }
  }
  const categories = r.model === "blogPost" ? await prisma.blogCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }) : [];
  const title = isNew ? `New ${r.singular.toLowerCase()}` : String(initial[r.titleField] || r.singular);
  return (
    <>
      <Link href={`/admin/content/${r.key}`} className="mb-3 inline-flex items-center gap-1 text-sm text-link"><ArrowLeft className="h-4 w-4" /> {r.label}</Link>
      <PageHeader title={title} />
      <ResourceForm resourceKey={r.key} initial={initial} categories={categories} canDelete={r.canDelete !== false} />
    </>
  );
}
