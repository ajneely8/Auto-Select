"use client";

import { useEffect, useRef } from "react";

/**
 * Silent, looping dealership walkthrough shown in the home hero. No controls and no play button: it
 * simply plays. Visitors who ask their device to reduce motion get the first frame held still.
 * Decorative, so it is hidden from assistive tech (the page's meaning doesn't depend on it).
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    // Some browsers ignore the autoplay attribute until the element is in the DOM; nudge it.
    v.play().catch(() => {});
  }, []);

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[240px] overflow-hidden rounded-[var(--radius-lg)] border border-white/15 bg-navy-900 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] sm:max-w-[280px] lg:justify-self-center">
      <video
        ref={ref}
        src="/video/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noremoteplayback nofullscreen"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none size-full object-cover"
      />
    </div>
  );
}
