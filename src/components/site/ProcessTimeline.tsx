import { Code2, PenTool, Rocket, Search, ShieldCheck } from "lucide-react";

export const PROCESS_STEPS = [
  { icon: Search, title: "Discover", text: "Workshops to understand your goals, users, money flows, compliance obligations and success metrics. Output: written scope, itemised estimate and plan." },
  { icon: PenTool, title: "Design", text: "Architecture, threat model, user journeys and visual design, reviewed and signed off before any code is written." },
  { icon: Code2, title: "Build", text: "Two-week sprints with a live demo at the end of each, code review on every change and a project board you can follow." },
  { icon: ShieldCheck, title: "Secure", text: "Automated and manual testing, dependency scanning and a security review against OWASP guidance before every release." },
  { icon: Rocket, title: "Launch", text: "Planned go-live with monitoring and a rollback plan, documentation, handover to your team and a warranty period." },
];

export function ProcessTimeline() {
  return (
    <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-4">
      <span className="absolute left-6 top-6 h-[calc(100%-3rem)] w-px bg-line lg:left-[10%] lg:right-[10%] lg:h-px lg:w-auto" aria-hidden />
      {PROCESS_STEPS.map(({ icon: Icon, title, text }, i) => (
        <li key={title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }} className="relative flex gap-5 lg:flex-col lg:items-center lg:gap-4 lg:text-center">
          <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-navy text-gold shadow">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Step {i + 1}</p>
            <h3 className="mt-1 text-lg font-semibold text-fg">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
