import { useId } from "react";

/**
 * Royal Crest mark: gold serif "N" inside a thin gold double ring, with a small royal-blue diamond on top.
 * Drawn as vector paths (no font dependency) so it renders identically everywhere, including the favicon.
 * `draw` turns it into the self-drawing outline used by the preloader.
 */
export const N_PATH =
  "M20.6 20h7.6v1.2h-1.1L38.6 39V21.2h-2.3V20h7.2v1.2h-2.3V44h-2.2L25.4 24.6v18.2h2.3V44h-7.1v-1.2h2.3V21.2h-2.3z";

export function LogoMark({ className = "h-10 w-10", draw = false, title }: { className?: string; draw?: boolean; title?: string }) {
  const id = useId().replace(/:/g, "");
  const gold = `url(#g${id})`;
  const strokeProps = draw ? { className: "crest-stroke", pathLength: 1 } : {};
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title} focusable="false">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F7D488" />
          <stop offset="0.5" stopColor="#E3A93B" />
          <stop offset="1" stopColor="#B9822A" />
        </linearGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FA8FF" />
          <stop offset="1" stopColor="#3D6BFF" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="33" r="27.5" fill="none" stroke={gold} strokeWidth="1.6" {...strokeProps} />
      <circle cx="32" cy="33" r="24" fill="none" stroke={gold} strokeWidth="0.8" {...strokeProps} />
      {draw ? (
        <>
          <path d={N_PATH} fill="none" stroke={gold} strokeWidth="0.6" {...strokeProps} />
          <path d={N_PATH} fill={gold} className="crest-fill" />
        </>
      ) : (
        <path d={N_PATH} fill={gold} />
      )}
      <path d="M32 1.6 36 5.6 32 9.6 28 5.6Z" fill={`url(#b${id})`} stroke="#0A0E16" strokeWidth="0.8" className={draw ? "crest-fill" : undefined} />
    </svg>
  );
}

export function Logo({ logoUrl, brand = "Nuvsera Technology", compact = false }: { logoUrl?: string; brand?: string; compact?: boolean }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={brand} className="h-10 w-auto" width={180} height={40} />;
  }
  return (
    <span className="flex items-center gap-3">
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-semibold tracking-[0.34em] text-ivory">NUVSERA</span>{" "}
        {!compact && <span className="mt-1.5 text-[7.5px] font-medium tracking-[0.3em] text-gold/85">TECHNOLOGY PRIVATE LIMITED</span>}
      </span>
    </span>
  );
}
