"use client";
import { useState } from "react";
import { MapPin } from "lucide-react";

const QUERY = "OM Tower, 32 Chowringhee Road, Park Street, Kolkata 700071";

/**
 * Google Map of the office, loaded only when the visitor asks for it (Google sets its own cookies, so nothing
 * is requested from Google before that click).
 */
export function MapEmbed({ mapUrl, className = "" }: { mapUrl: string; className?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] border border-gold/20 bg-navy-800 ${className}`}>
      {show ? (
        <iframe
          title="Map: Nuvsera Technology, OM Tower, Park Street, Kolkata"
          src={`https://www.google.com/maps?q=${encodeURIComponent(QUERY)}&output=embed`}
          className="absolute inset-0 h-full w-full [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="bg-grid absolute inset-0 opacity-70" aria-hidden />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold"><MapPin className="h-6 w-6" aria-hidden /></span>
          <p className="relative max-w-xs text-sm text-muted">706, 7th Floor, OM Tower, 32 Chowringhee Road, Park Street, Kolkata 700071</p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setShow(true)} className="btn-outline">Show map</button>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">Open in Google Maps</a>
          </div>
          <p className="relative text-xs text-muted/80">Showing the map loads content and cookies from Google.</p>
        </div>
      )}
    </div>
  );
}
