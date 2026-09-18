"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/format";

export interface HeroVehicle {
  slug: string;
  title: string;
  price: number | null;
  photo: { url: string; alt: string };
}

const INTERVAL_MS = 5000;

/**
 * Hero vehicle showcase: cross-fades through a handful of in-stock vehicles.
 * Auto-advances every 5s, pauses on hover/focus, and stops entirely for prefers-reduced-motion
 * (manual prev/next and dot controls always work). Each slide links to its own vehicle page.
 */
export function HeroShowcase({ vehicles }: { vehicles: HeroVehicle[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const n = vehicles.length;

  useEffect(() => {
    if (n <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % n), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [n, paused]);

  useEffect(() => {
    if (liveRef.current && n > 0) liveRef.current.textContent = `Showing vehicle ${index + 1} of ${n}: ${vehicles[index].title}`;
  }, [index, n, vehicles]);

  if (n === 0) return null;
  const current = vehicles[index];
  const go = (i: number) => setIndex(((i % n) + n) % n);

  return (
    <figure className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="overflow-hidden rounded-[var(--radius-md)] ring-1 ring-white/10">
        <div className="group relative aspect-[16/10]">
          {/* Full-cover link sits under the images (which are pointer-events-none) so a click anywhere on the photo navigates. */}
          <Link href={`/inventory/${current.slug}`} aria-label={`View details for ${current.title}, ${formatPrice(current.price)}`} className="absolute inset-0 z-0" />
          {vehicles.map((v, i) => (
            <Image
              key={v.slug}
              src={v.photo.url}
              alt={v.photo.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={85}
              className={`pointer-events-none object-cover transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                i === index ? "opacity-100 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100" : "opacity-0"
              }`}
            />
          ))}

          {n > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Show previous vehicle"
                className="absolute left-2 top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Show next vehicle"
                className="absolute right-2 top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
              <div role="tablist" aria-label="Featured vehicles" className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
                {vehicles.map((v, i) => (
                  <button
                    key={v.slug}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show ${v.title}`}
                    onClick={() => go(i)}
                    className={`h-1.5 rounded-full transition-[width,background-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${
                      i === index ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <Link href={`/inventory/${current.slug}`} className="group flex items-center justify-between gap-3 bg-charcoal px-4 py-3 text-sm hover:bg-charcoal/90">
          <span className="min-w-0">
            <span className="block text-xs uppercase tracking-[0.12em] text-white/60">In stock now</span>
            <span className="block truncate font-semibold text-white">{current.title}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 font-display text-xl font-bold tabular text-white">
            {formatPrice(current.price)}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </div>
      <p ref={liveRef} aria-live="polite" className="sr-only" />
    </figure>
  );
}
