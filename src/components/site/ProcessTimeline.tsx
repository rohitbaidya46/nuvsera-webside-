import { Code2, LifeBuoy, PenTool, Rocket, Search, TestTube2 } from "lucide-react";

export const PROCESS_STEPS = [
  { icon: Search, title: "Discover", text: "Workshops to understand goals, users, constraints and success metrics. Output: scope, estimate and plan." },
  { icon: PenTool, title: "Design", text: "Architecture, user journeys, wireframes and visual design — reviewed and signed off before code begins." },
  { icon: Code2, title: "Develop", text: "Two-week sprints with demos, code review on every change and a live board you can follow." },
  { icon: TestTube2, title: "Test", text: "Automated and manual QA, performance checks and a security review against OWASP guidance." },
  { icon: Rocket, title: "Launch", text: "Planned go-live with monitoring, rollback plan, documentation and handover to your team." },
  { icon: LifeBuoy, title: "Support", text: "Warranty fixes, monitoring, updates and a roadmap for what comes next." },
];

export function ProcessTimeline() {
  return (
    <ol className="relative grid gap-8 lg:grid-cols-6 lg:gap-4">
      <span className="absolute left-6 top-6 h-[calc(100%-3rem)] w-px bg-line lg:left-[8.33%] lg:right-[8.33%] lg:h-px lg:w-auto" aria-hidden />
      {PROCESS_STEPS.map(({ icon: Icon, title, text }, i) => (
        <li key={title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }} className="relative flex gap-5 lg:flex-col lg:items-center lg:gap-4 lg:text-center">
          <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-surface bg-navy text-gold shadow">
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
