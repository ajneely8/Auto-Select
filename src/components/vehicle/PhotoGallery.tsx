"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { VehiclePhoto } from "@/lib/types";
import { track } from "@/lib/analytics";

/** Horizontal swipe detection that leaves vertical scrolling alone. */
function useSwipe(onLeft: () => void, onRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: ReactPointerEvent) => {
      if (e.pointerType === "mouse") return;
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: ReactPointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? onLeft : onRight)();
    },
  };
}

export function PhotoGallery({ photos, title, stockNumber }: { photos: VehiclePhoto[]; title: string; stockNumber: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const n = photos.length;

  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);
  const swipe = useSwipe(next, prev);

  // Keep the active thumbnail visible.
  useEffect(() => {
    const el = thumbsRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  function openLightbox() {
    setOpen(true);
    track("gallery_opened", { stock_number: stockNumber, photo_index: index + 1 });
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  if (!n) {
    return <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--radius-md)] border border-line bg-surface text-slate">Photos coming soon</div>;
  }

  const current = photos[index];

  return (
    <div>
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface-2"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} photos`}
        onKeyDown={onKey}
        {...swipe}
        style={{ touchAction: "pan-y" }}
      >
        <button type="button" onClick={openLightbox} className="absolute inset-0 block cursor-zoom-in" aria-label={`Open full-screen gallery, photo ${index + 1} of ${n}`}>
          <Image key={current.url} src={current.url} alt={current.alt} fill priority={index === 0} sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover animate-fade-in" />
        </button>
        {n > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous photo" className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-card)] hover:bg-white">
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button type="button" onClick={next} aria-label="Next photo" className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-card)] hover:bg-white">
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </>
        )}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-[var(--radius-xs)] bg-black/65 px-2 py-1 text-xs font-semibold text-white tabular" aria-live="polite">
          {index + 1} / {n}
        </div>
        <button type="button" onClick={openLightbox} className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-sm)] bg-white/90 px-3 text-xs font-semibold text-ink shadow-[var(--shadow-card)] hover:bg-white">
          <Expand className="size-4" aria-hidden /> Full screen
        </button>
      </div>

      {n > 1 && (
        <ul ref={thumbsRef} className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Photo thumbnails">
          {photos.map((p, i) => (
            <li key={p.url} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1} of ${n}`}
                aria-current={i === index ? "true" : undefined}
                className="relative block h-16 w-[88px] overflow-hidden rounded-[var(--radius-sm)] border-2 border-transparent opacity-80 hover:opacity-100 aria-[current=true]:border-accent-text aria-[current=true]:opacity-100"
              >
                <Image src={p.url} alt="" fill sizes="88px" loading="lazy" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${title} — full-screen gallery`}
        onClose={() => setOpen(false)}
        onKeyDown={onKey}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black open:animate-fade-in"
      >
        {open && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm text-white/80 tabular" aria-live="polite">
                {index + 1} / {n}
              </p>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] hover:bg-white/10" aria-label="Close gallery">
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <div className="relative flex-1" {...swipe} style={{ touchAction: "pan-y" }}>
              <Image key={current.url} src={current.url} alt={current.alt} fill sizes="100vw" quality={85} className="object-contain animate-fade-in" />
              {n > 1 && (
                <>
                  <button type="button" onClick={prev} aria-label="Previous photo" className="absolute left-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
                    <ChevronLeft className="size-7" aria-hidden />
                  </button>
                  <button type="button" onClick={next} aria-label="Next photo" className="absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25">
                    <ChevronRight className="size-7" aria-hidden />
                  </button>
                </>
              )}
            </div>
            <p className="px-4 py-3 text-center text-sm text-white/70">{current.alt}</p>
          </div>
        )}
      </dialog>
    </div>
  );
}
