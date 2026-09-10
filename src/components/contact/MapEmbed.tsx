"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import { business, fullAddress, mapsLinks } from "@/config/business";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Privacy-conscious map: nothing from Google loads until the visitor asks for it.
 * Until then, a static card shows the address with links to open Google Maps directly.
 */
export function MapEmbed({ className = "" }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Move focus to the map once it replaces the button, so keyboard users aren't dropped at the top of the page.
  useEffect(() => {
    if (loaded) frameRef.current?.focus();
  }, [loaded]);

  const linkClass = "inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-navy-700 underline-offset-2 hover:underline";

  return (
    <div className={`overflow-hidden rounded-[var(--radius-md)] border border-line bg-white ${className}`}>
      <div className="relative min-h-72 bg-surface sm:aspect-[16/10] sm:min-h-0">
        {loaded ? (
          <iframe
            ref={frameRef}
            src={mapsLinks.embed}
            title={`Map showing ${business.name} at ${fullAddress}`}
            className="absolute inset-0 size-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex size-11 items-center justify-center rounded-[var(--radius-sm)] bg-navy-900 text-white" aria-hidden>
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">{business.name}</p>
              <address className="text-sm not-italic text-slate">{fullAddress}</address>
            </div>
            <button type="button" onClick={() => setLoaded(true)} className={buttonClasses("secondary", "md")}>
              Load interactive map
            </button>
            <p className="max-w-sm text-xs leading-relaxed text-muted">
              The map is provided by Google and loads only if you choose. Loading it connects your browser to Google, which may collect usage data.
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line px-4">
        <a href={mapsLinks.place} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <ExternalLink className="size-4" aria-hidden />
          Open in Google Maps<span className="sr-only"> (opens in new tab)</span>
        </a>
        <a href={mapsLinks.directions} target="_blank" rel="noopener noreferrer" data-track="directions" className={linkClass}>
          <Navigation className="size-4" aria-hidden />
          Get directions<span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </div>
  );
}
