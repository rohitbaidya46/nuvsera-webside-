import { LogoMark } from "@/components/site/Logo";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <LogoMark />
          <span className="text-lg font-bold text-fg">Nuvsera <span className="font-semibold text-muted">Admin</span></span>
        </div>
        <div className="card p-8 shadow-lg">
          <h1 className="text-xl font-semibold text-fg">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-muted">Authorised personnel only. All activity is logged.</p>
      </div>
    </main>
  );
}
