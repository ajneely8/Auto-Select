"use client";

/* eslint-disable @next/next/no-img-element -- frames are swapped at 30–60fps from a decoded cache; next/image would re-request. */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Play, Pause, Rotate3d, ImageOff } from "lucide-react";
import { createFrameLoader, wrapIndex, type FrameLoader } from "@/lib/media/frames";
import { track } from "@/lib/analytics";

export interface Viewer360Props {
  /** Ordered frame URLs (36, 48, or 72). */
  frames?: string[] | null;
  /** Hosted third-party spin/tour URL, used when frames are not self-hosted. */
  embedUrl?: string | null;
  poster: { url: string; alt: string };
  /** e.g. "2016 Nissan Altima" — used in accessible labels. */
  title: string;
  kind?: "exterior" | "interior";
  isDemo?: boolean;
  stockNumber?: string;
  /** Called when the sequence can't load, so the page can switch to the photo gallery. */
  onFallback?: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

export function Vehicle360Viewer(props: Viewer360Props) {
  if (props.frames?.length) return <FrameViewer {...props} frames={props.frames} />;
  if (props.embedUrl) return <EmbedViewer {...props} embedUrl={props.embedUrl} />;
  return null;
}

/* ─────────────────────────── Frame-sequence viewer ─────────────────────────── */

function FrameViewer({ frames, poster, title, kind = "exterior", isDemo, stockNumber, onFallback }: Viewer360Props & { frames: string[] }) {
  const count = frames.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<FrameLoader | null>(null);
  const drag = useRef<{ x: number; y: number; frame: number; panX: number; panY: number; moved: boolean } | null>(null);
  const startedRef = useRef(false);

  const [frame, setFrame] = useState(0);
  const [shown, setShown] = useState(0); // nearest loaded frame actually displayed
  const [progress, setProgress] = useState({ loaded: 0, failed: 0 });
  const [active, setActive] = useState(false); // full sequence requested
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [cssFullscreen, setCssFullscreen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const allLoaded = progress.loaded + progress.failed >= count;
  const broken = progress.failed > count * 0.3;

  // Create the loader once per sequence.
  useEffect(() => {
    const loader = createFrameLoader(frames, {
      onProgress: (loaded, _total, failed) => setProgress({ loaded, failed }),
    });
    loaderRef.current = loader;
    return () => loader.dispose();
  }, [frames]);

  // Lazy: warm up frames near the start only when the viewer approaches the viewport.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          loaderRef.current?.preloadAround(0, 2).then(() => setShown(loaderRef.current!.nearestLoaded(0)));
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const begin = useCallback(
    (source: string) => {
      if (!startedRef.current) {
        startedRef.current = true;
        track("vehicle_360_started", { stock_number: stockNumber, frame_count: count, source });
      }
      if (!active) {
        setActive(true);
        loaderRef.current?.loadAll(frame);
      }
    },
    [active, count, frame, stockNumber],
  );

  // Show the requested frame if loaded, otherwise the closest loaded one.
  useEffect(() => {
    const l = loaderRef.current;
    if (!l) return;
     
    setShown(l.isLoaded(frame) ? frame : l.nearestLoaded(frame));
    if (!l.isLoaded(frame)) l.preloadAround(frame, 2);
  }, [frame, progress.loaded]);

  // Auto-rotate: desktop only, never with reduced motion, starts once frames are in, stops on any interaction.
  useEffect(() => {
    if (!autoRotate || !allLoaded) return;
    const id = window.setInterval(() => setFrame((f) => wrapIndex(f + 1, count)), 1000 / Math.max(12, count / 3));
    return () => window.clearInterval(id);
  }, [autoRotate, allLoaded, count]);

  const stopAuto = () => setAutoRotate(false);

  const rotate = (delta: number) => {
    begin("controls");
    stopAuto();
    setFrame((f) => wrapIndex(f + delta, count));
  };

  const setZoomClamped = (z: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));
    setZoom(next);
    if (next === 1) setPan({ x: 0, y: 0 });
  };

  const reset = () => {
    stopAuto();
    setFrame(0);
    setZoomClamped(1);
  };

  // Pointer (mouse + touch + pen). Horizontal drag rotates; when zoomed, drag pans.
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    begin("drag");
    stopAuto();
    drag.current = { x: e.clientX, y: e.clientY, frame, panX: pan.x, panY: pan.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > 3) d.moved = true;
    if (zoom > 1) {
      const w = stageRef.current?.clientWidth ?? 1;
      const h = stageRef.current?.clientHeight ?? 1;
      const maxX = ((zoom - 1) * w) / 2;
      const maxY = ((zoom - 1) * h) / 2;
      setPan({ x: Math.max(-maxX, Math.min(maxX, d.panX + dx)), y: Math.max(-maxY, Math.min(maxY, d.panY + dy)) });
      return;
    }
    const width = stageRef.current?.clientWidth ?? 600;
    // One full drag across the viewer ≈ one full rotation. Dragging right turns the vehicle right.
    const perFrame = width / count;
    setFrame(wrapIndex(d.frame - Math.round(dx / perFrame), count));
  }
  function onPointerUp() {
    drag.current = null;
    setDragging(false);
  }

  function onWheel(e: React.WheelEvent) {
    // Only pinch (ctrlKey on trackpads) or Ctrl+wheel zooms — normal scrolling is never hijacked.
    if (!e.ctrlKey) return;
    e.preventDefault();
    begin("wheel");
    setZoomClamped(zoom * (e.deltaY < 0 ? 1.12 : 0.89));
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 5 : 1;
    const handled = ["ArrowLeft", "ArrowRight", "+", "=", "-", "_", "Home", "0", " "];
    if (!handled.includes(e.key)) return;
    e.preventDefault();
    if (e.key === "ArrowLeft") rotate(step);
    if (e.key === "ArrowRight") rotate(-step);
    if (e.key === "+" || e.key === "=") setZoomClamped(zoom + 0.25);
    if (e.key === "-" || e.key === "_") setZoomClamped(zoom - 0.25);
    if (e.key === "Home" || e.key === "0") reset();
    if (e.key === " ") setAutoRotate((a) => !a);
  }

  // Fullscreen API with a CSS fallback (e.g. iPhone Safari doesn't support element fullscreen).
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  async function toggleFullscreen() {
    begin("fullscreen");
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) return document.exitFullscreen();
    if (cssFullscreen) return setCssFullscreen(false);
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        return;
      } catch {}
    }
    setCssFullscreen(true);
  }
  useEffect(() => {
    if (!cssFullscreen) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setCssFullscreen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cssFullscreen]);

  const angle = Math.round((frame / count) * 360);
  const isFull = fullscreen || cssFullscreen;
  const pct = Math.round(((progress.loaded + progress.failed) / count) * 100);
  const instructionsId = `v360-help-${kind}`;
  const canAutoRotate = typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (broken) {
    return (
      <div className="flex aspect-[16/9] flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-6 text-center">
        <ImageOff className="size-7 text-muted" aria-hidden />
        <p className="font-semibold text-ink">The 360° view couldn&apos;t load.</p>
        <p className="text-sm text-slate">Please use the photo gallery instead, or refresh the page to try again.</p>
        {onFallback && (
          <button type="button" onClick={onFallback} className="min-h-11 rounded-[var(--radius-sm)] border border-line-strong bg-white px-4 text-sm font-semibold hover:border-ink">
            View photos
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden bg-[#e9ecf0] ${isFull ? "flex flex-col" : "rounded-[var(--radius-md)] border border-line"} ${cssFullscreen ? "fixed inset-0 z-[60]" : ""}`}
    >
      <div
        ref={stageRef}
        role="img"
        tabIndex={0}
        aria-roledescription="360-degree vehicle viewer"
        aria-label={`${title}, ${kind} view, rotated ${angle} degrees${zoom > 1 ? `, zoomed ${Math.round(zoom * 100)}%` : ""}`}
        aria-describedby={instructionsId}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={() => setZoomClamped(zoom > 1 ? 1 : 2)}
        className={`relative select-none outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent-text ${isFull ? "flex-1" : "aspect-[16/9]"} ${zoom > 1 ? (dragging ? "cursor-grabbing" : "cursor-move") : dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: zoom > 1 ? "none" : "pan-y" }}
      >
        <img
          src={progress.loaded > 0 ? frames[shown] : poster.url}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain will-change-transform"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transition: dragging ? "none" : "transform 160ms ease-out" }}
        />

        {!active && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              begin("start_button");
              const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
              if (desktop && canAutoRotate) setAutoRotate(true);
              stageRef.current?.focus();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute left-1/2 top-1/2 inline-flex min-h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-navy-900/90 px-5 text-sm font-semibold text-white shadow-[var(--shadow-raised)] hover:bg-navy-900"
          >
            <Rotate3d className="size-5" aria-hidden /> Start 360° view
          </button>
        )}

        {active && !allLoaded && (
          <div className="absolute inset-x-0 top-0" role="progressbar" aria-label="Loading 360° frames" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className="h-1 bg-accent transition-[width] duration-150" style={{ width: `${pct}%` }} />
            <p className="absolute left-3 top-2.5 rounded-[var(--radius-xs)] bg-black/60 px-2 py-0.5 text-xs font-medium text-white tabular">Loading {pct}%</p>
          </div>
        )}

        {isDemo && (
          <p className="pointer-events-none absolute left-3 bottom-3 max-w-[70%] rounded-[var(--radius-xs)] border border-[#f0d9a6] bg-warning-soft px-2 py-1 text-xs font-semibold text-warning">
            Demonstration sequence — a rendered model, not photos of this vehicle
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-white px-2 py-1.5">
        <div className="flex items-center gap-1">
          <CtrlButton label="Rotate left" onClick={() => rotate(1)}>
            <ChevronLeft className="size-5" aria-hidden />
          </CtrlButton>
          <span className="min-w-12 text-center text-xs font-semibold text-slate tabular" aria-hidden>
            {angle}°
          </span>
          <CtrlButton label="Rotate right" onClick={() => rotate(-1)}>
            <ChevronRight className="size-5" aria-hidden />
          </CtrlButton>
          {canAutoRotate && (
            <CtrlButton
              label={autoRotate ? "Stop auto-rotate" : "Start auto-rotate"}
              pressed={autoRotate}
              onClick={() => {
                begin("auto_rotate");
                setAutoRotate((a) => !a);
              }}
            >
              {autoRotate ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            </CtrlButton>
          )}
        </div>
        <div className="flex items-center gap-1">
          <CtrlButton label="Zoom out" onClick={() => setZoomClamped(zoom - 0.25)} disabled={zoom <= MIN_ZOOM}>
            <ZoomOut className="size-5" aria-hidden />
          </CtrlButton>
          <CtrlButton label="Zoom in" onClick={() => { begin("zoom"); setZoomClamped(zoom + 0.25); }} disabled={zoom >= MAX_ZOOM}>
            <ZoomIn className="size-5" aria-hidden />
          </CtrlButton>
          <CtrlButton label="Reset view" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden />
          </CtrlButton>
          <CtrlButton label={isFull ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
            {isFull ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
          </CtrlButton>
        </div>
      </div>
      <p id={instructionsId} className={isFull ? "sr-only" : "bg-white px-3 pb-2 text-xs text-muted"}>
        Drag or swipe sideways to rotate. Keyboard: left and right arrows rotate (Shift for bigger steps), plus and minus zoom, 0 resets, space toggles auto-rotate.
        Pinch or Ctrl + scroll also zooms.
      </p>
    </div>
  );
}

function CtrlButton({ label, onClick, children, disabled, pressed }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] text-ink hover:bg-surface disabled:opacity-40 aria-pressed:bg-navy-900 aria-pressed:text-white"
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── Hosted tour (iframe) ─────────────────────────── */

function EmbedViewer({ embedUrl, poster, title, kind = "exterior", stockNumber }: Viewer360Props & { embedUrl: string }) {
  const [load, setLoad] = useState(false);
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-md)] border border-line bg-[#e9ecf0]">
      {load ? (
        <iframe src={embedUrl} title={`${title} — ${kind} 360° tour`} allow="fullscreen; accelerometer; gyroscope" allowFullScreen loading="lazy" className="absolute inset-0 h-full w-full border-0" />
      ) : (
        <>
          <img src={poster.url} alt={poster.alt} className="absolute inset-0 h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setLoad(true);
              track("vehicle_360_started", { stock_number: stockNumber, source: `embed_${kind}` });
            }}
            className="absolute left-1/2 top-1/2 inline-flex min-h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-navy-900/90 px-5 text-sm font-semibold text-white shadow-[var(--shadow-raised)] hover:bg-navy-900"
          >
            <Rotate3d className="size-5" aria-hidden /> Load {kind} 360° tour
          </button>
        </>
      )}
    </div>
  );
}
