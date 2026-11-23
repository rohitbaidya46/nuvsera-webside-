import { AuthCard } from "@/components/admin/AuthCard";
import { ForgotPasswordForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return <AuthCard title="Reset your password" subtitle="We’ll email you a secure link."><ForgotPasswordForm /></AuthCard>;
}
