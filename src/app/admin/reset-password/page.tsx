import { Suspense } from "react";
import { AuthCard } from "@/components/admin/AuthCard";
import { ResetPasswordForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Choose a new password" };

export default function ResetPage() {
  return <AuthCard title="Choose a new password"><Suspense><ResetPasswordForm /></Suspense></AuthCard>;
}
