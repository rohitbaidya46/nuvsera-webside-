"use client";
import { useState } from "react";

/**
 * Lightweight single-series charts (no chart library). One hue (the theme's link blue, which is
 * re-stepped for dark mode via CSS variable), 4px rounded data-ends anchored to the baseline,
 * recessive grid, per-mark hover tooltip with hit targets larger than the mark, and a table view.
 */
export function WeeklyBars({ data }: { data: { label: string; leads: number; won: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(1, ...data.map((d) => d.leads));
  const ticks = [0, Math.ceil(max / 2), max];
  const W = 640, H = 200, pad = { l: 28, b: 24, t: 10 };
  const bw = (W - pad.l) / data.length;
  const y = (v: number) => H - pad.b - ((H - pad.b - pad.t) * v) / max;

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button type="button" onClick={() => setTable((t) => !t)} className="text-xs font-medium text-link">{table ? "Show chart" : "Show as table"}</button>
      </div>
      {table ? (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th className="py-1 font-medium">Week of</th><th className="font-medium">Leads</th><th className="font-medium">Won</th><th className="font-medium">Conversion</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.label} className="border-t border-line"><td className="py-1.5">{d.label}</td><td>{d.leads}</td><td>{d.won}</td><td>{d.leads ? Math.round((d.won / d.leads) * 100) : 0}%</td></tr>)}</tbody>
        </table>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Leads per week for the last 12 weeks">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={W} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
                <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{t}</text>
              </g>
            ))}
            {data.map((d, i) => {
              const x = pad.l + i * bw + 4;
              const w = Math.max(4, bw - 8);
              const top = y(d.leads);
              const h = H - pad.b - top;
              return (
                <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.label}: ${d.leads} leads, ${d.won} won`}>
                  <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.b - pad.t} fill="transparent" />
                  {d.leads > 0 && <path d={`M${x},${H - pad.b} V${top + 4} q0,-4 4,-4 h${w - 8} q4,0 4,4 V${H - pad.b} Z`} fill="var(--link)" opacity={hover === null || hover === i ? 1 : 0.45} />}
                  {i % 2 === 0 && <text x={x + w / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--muted)">{d.label}</text>}
                </g>
              );
            })}
          </svg>
          {hover !== null && (
            <div className="pointer-events-none absolute top-0 rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg" style={{ left: `${((pad.l + hover * bw + bw / 2) / W) * 100}%`, transform: "translateX(-50%)" }}>
              <p className="font-semibold text-fg">Week of {data[hover].label}</p>
              <p className="text-muted">{data[hover].leads} leads · {data[hover].won} won ({data[hover].leads ? Math.round((data[hover].won / data[hover].leads) * 100) : 0}%)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BarList({ rows, empty = "No data yet" }: { rows: { label: string; value: number }[]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${r.value}`}>
          <div className="flex justify-between text-sm"><span className="truncate text-fg">{r.label}</span><span className="ml-3 font-medium tabular-nums text-fg">{r.value}</span></div>
          <div className="mt-1 h-2 rounded-full bg-surface"><div className="h-2 rounded-full bg-link" style={{ width: `${(r.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}
