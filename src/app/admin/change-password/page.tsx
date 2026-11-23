import { redirect } from "next/navigation";
import { AuthCard } from "@/components/admin/AuthCard";
import { ChangePasswordForm } from "@/components/admin/AuthForms";
import { PASSWORD_MAX_AGE_DAYS, getSession, passwordExpired } from "@/lib/auth";

export const metadata = { title: "Change password" };

export default async function ChangePasswordPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!s.twoFactorVerified) redirect("/admin/two-factor");
  const reason = s.user.mustChangePassword
    ? "Please choose a new password to finish setting up your account."
    : passwordExpired(s.user)
      ? `Your password is more than ${PASSWORD_MAX_AGE_DAYS} days old. Please choose a new one to continue.`
      : undefined;
  return <AuthCard title="Change password"><ChangePasswordForm reason={reason} /></AuthCard>;
}
