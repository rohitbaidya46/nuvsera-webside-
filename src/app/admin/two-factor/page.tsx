import { redirect } from "next/navigation";
import { AuthCard } from "@/components/admin/AuthCard";
import { TwoFactorForm } from "@/components/admin/AuthForms";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Two-factor authentication" };

export default async function TwoFactorPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (s.twoFactorVerified) redirect("/admin");
  return <AuthCard title="Two-factor authentication"><TwoFactorForm /></AuthCard>;
}
