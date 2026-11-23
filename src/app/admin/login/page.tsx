import { redirect } from "next/navigation";
import { AuthCard } from "@/components/admin/AuthCard";
import { LoginForm } from "@/components/admin/AuthForms";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const s = await getSession();
  if (s?.twoFactorVerified) redirect("/admin");
  return <AuthCard title="Sign in" subtitle="Nuvsera Technology administration"><LoginForm /></AuthCard>;
}
