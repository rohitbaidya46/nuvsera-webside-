import Link from "next/link";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "", actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={`rounded-xl border border-line bg-card p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-fg">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  CONTACTED: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  PROPOSAL_SENT: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  WON: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  LOST: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  DRAFT: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SCHEDULED: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  PUBLISHED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  REVIEWING: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  SHORTLISTED: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  REJECTED: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  HIRED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  UNSUBSCRIBED: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[value] ?? "bg-surface text-fg"}`}>{label ?? value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</span>;
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      <span className="text-muted">Page {page} of {pages}</span>
      <div className="flex gap-2">
        {page > 1 && <Link className="btn-outline min-h-9 py-1.5" href={href(page - 1)}>Previous</Link>}
        {page < pages && <Link className="btn-outline min-h-9 py-1.5" href={href(page + 1)}>Next</Link>}
      </div>
    </nav>
  );
}

export const fmtDate = (d: Date | string | null | undefined, time = true) =>
  d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", ...(time ? { timeStyle: "short" } : {}) }) : "—";
