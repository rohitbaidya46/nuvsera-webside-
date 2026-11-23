export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="10" fill="#0B1B3A" />
      <path d="M11 29V11l18 18V11" fill="none" stroke="#E3A93B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29" cy="11" r="2.6" fill="#3D6BFF" />
    </svg>
  );
}

export function Logo({ logoUrl, brand = "Nuvsera Technology" }: { logoUrl?: string; brand?: string }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={brand} className="h-9 w-auto" width={160} height={36} />;
  }
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-lg font-bold leading-none tracking-tight text-fg">
        Nuvsera<span className="font-semibold text-muted"> Technology</span>
      </span>
    </span>
  );
}
