import { Fragment, type ElementType } from "react";

/**
 * Heading that reveals line by line behind a mask as it scrolls into view. Server-rendered; the
 * RevealObserver groups words into visual lines and staggers them. Screen readers get the plain text.
 */
export function SplitText({ text, as: Tag = "h2", className = "", id, delay = 0, accentFrom }: { text: string; as?: ElementType; className?: string; id?: string; delay?: number; /** Words from this index on get the gold gradient. */ accentFrom?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag id={id} className={className} data-split aria-label={text} style={delay ? { ["--reveal-delay" as string]: `${delay}ms` } : undefined}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="split-line" aria-hidden>
            <span className={accentFrom !== undefined && i >= accentFrom ? "text-gold-gradient italic" : undefined}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Thin gold line that wipes in from the left (section transitions). */
export function GoldRule({ className = "" }: { className?: string }) {
  return <div aria-hidden data-wipe className={`h-px w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent ${className}`} />;
}
