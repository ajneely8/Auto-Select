"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Silent, looping dealership video behind the home hero, shown as the full uncropped frame. No controls and no play button:
 * it simply plays. The inventory-photo background sits underneath and shows until the video is ready
 * (and stays for visitors who ask their device to reduce motion, or if the video can't play).
 * Decorative, so it is hidden from assistive tech.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReduceMotion(true);
      return;
    }
    const v = ref.current;
    if (!v) return;
    // The video can start playing before React attaches handlers, so listen here and also check now.
    const show = () => setPlaying(true);
    v.addEventListener("playing", show);
    if (!v.paused && v.readyState >= 3) show();
    // Some browsers ignore the autoplay attribute until the element is in the DOM; nudge it.
    v.play().catch(() => {});
    return () => v.removeEventListener("playing", show);
  }, []);

  if (reduceMotion) return null;

  const fade = `transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`;

  return (
    <>
      {/* Fills the space beside the vertical frame with a soft, blurred copy of the same footage. */}
      <video
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
        className={`pointer-events-none absolute inset-0 size-full scale-110 object-cover blur-2xl ${fade}`}
      />
      {/* The full frame, uncropped. */}
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
        className={`pointer-events-none absolute inset-0 size-full object-contain ${fade}`}
      />
    </>
  );
}
