import { SplitText } from "@/components/experience/SplitText";

export function SectionHeading({ eyebrow, title, intro, center = false, id }: { eyebrow?: string; title: string; intro?: string; center?: boolean; id?: string }) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p data-reveal className="eyebrow">{eyebrow}</p>}
      <SplitText id={id} text={title} className="h-section mt-5 text-ivory" />
      {intro && <p data-reveal style={{ ["--reveal-delay" as string]: "150ms" }} className="lead mt-6">{intro}</p>}
    </div>
  );
}
