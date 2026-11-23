import { ChevronDown } from "lucide-react";
import { JsonLd } from "./JsonLd";

/** Native <details> accordion: keyboard and screen-reader accessible without JavaScript. Emits FAQPage schema. */
export function FaqList({ items, schema = true }: { items: { question: string; answer: string }[]; schema?: boolean }) {
  if (!items.length) return null;
  return (
    <>
      <div className="divide-y divide-line rounded-2xl border border-line bg-card">
        {items.map((f) => (
          <details key={f.question} className="group p-5 sm:p-6">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold text-fg [&::-webkit-details-marker]:hidden">
              {f.question}
              <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-3 leading-7 text-muted">{f.answer}</p>
          </details>
        ))}
      </div>
      {schema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }}
        />
      )}
    </>
  );
}
