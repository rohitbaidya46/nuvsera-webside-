export function SectionHeading({ eyebrow, title, intro, center = false, id }: { eyebrow?: string; title: string; intro?: string; center?: boolean; id?: string }) {
  return (
    <div data-reveal className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="h-section mt-3 text-fg">{title}</h2>
      {intro && <p className="lead mt-4">{intro}</p>}
    </div>
  );
}
