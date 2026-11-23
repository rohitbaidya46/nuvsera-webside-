import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { getSettings, publicSettings } from "@/lib/settings";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  await requireAdmin("settings.manage");
  return (
    <>
      <PageHeader title="Site settings" description="Company details, footer registrations, contact channels, tracking and email delivery." />
      <SettingsForm initial={publicSettings(await getSettings())} />
    </>
  );
}
