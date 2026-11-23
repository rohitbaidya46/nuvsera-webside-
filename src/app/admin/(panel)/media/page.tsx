import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Media library" };

export default async function MediaPage() {
  await requireAdmin("media.manage");
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return (
    <>
      <PageHeader title="Media library" description="Images are automatically resized, stripped of location metadata and compressed to WebP." />
      <MediaLibrary items={items.map(({ id, url, alt, filename, width, height, size }) => ({ id, url, alt, filename, width, height, size }))} />
    </>
  );
}
