import { CheckCircle2, Lock, TrendingUp } from "lucide-react";

/** Decorative, original CSS illustration — an abstract product dashboard. Hidden from assistive tech. */
export function HeroVisual() {
  const bars = [38, 62, 48, 75, 58, 88, 70, 95, 80];
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none lg:max-w-none">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" /><span className="h-2.5 w-2.5 rounded-full bg-white/25" /><span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="ml-3 h-2 w-32 rounded bg-white/15" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {["Uptime", "Releases", "Open issues"].map((l, n) => (
            <div key={l} className="rounded-xl bg-white/[0.07] p-3">
              <div className="text-[11px] text-slate-400">{l}</div>
              <div className="mt-2 h-2.5 rounded bg-white/25" style={{ width: `${[70, 50, 35][n]}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-white/[0.07] p-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400"><span>Throughput</span><TrendingUp className="h-3.5 w-3.5 text-gold" /></div>
          <div className="mt-3 flex h-28 items-end gap-2">
            {bars.map((h, n) => <div key={n} className={`flex-1 rounded-t ${n === bars.length - 2 ? "bg-gold" : "bg-brand/70"}`} style={{ height: `${h}%` }} />)}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[64, 82, 48].map((w, n) => (
            <div key={n} className="flex items-center gap-3 rounded-lg bg-white/[0.05] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="h-2 rounded bg-white/20" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -left-4 bottom-10 hidden items-center gap-2 rounded-xl border border-white/10 bg-navy-800 px-3.5 py-2.5 text-xs font-medium text-white shadow-xl sm:flex">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Security review passed
      </div>
      <div className="absolute -right-3 top-12 hidden items-center gap-2 rounded-xl border border-white/10 bg-navy-800 px-3.5 py-2.5 text-xs font-medium text-white shadow-xl sm:flex">
        <Lock className="h-4 w-4 text-gold" /> Encrypted at rest
      </div>
    </div>
  );
}
