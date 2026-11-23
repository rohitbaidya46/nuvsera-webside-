"use client";
import { useRouter } from "next/navigation";
import { api } from "./api";

export function RevokeSession({ id }: { id: string }) {
  const router = useRouter();
  return <button className="text-sm text-red-700 hover:underline dark:text-red-400" onClick={() => api(`/api/admin/sessions/${id}`, { method: "DELETE" }).then(() => router.refresh())}>Sign out</button>;
}
