"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Click-to-play video background for PageHero, replacing the decorative diagonal pattern once
 * played. Deferred like MapEmbed: the third-party player (and whatever tracking it brings) never
 * loads until the visitor asks for it.
 */
export function HeroVideo({ facebookVideoUrl }: { facebookVideoUrl: string }) {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label="Play video"
        className="group absolute inset-y-0 right-0 flex w-1/2 items-center justify-center"
      >
        <div aria-hidden className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(115deg,#fff_0_1px,transparent_1px_22px)]" />
        <span className="relative flex size-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm transition-transform duration-150 group-hover:scale-105 group-hover:bg-white/25 sm:size-20">
          <Play className="size-7 translate-x-0.5 fill-white text-white sm:size-8" aria-hidden />
        </span>
      </button>
    );
  }

  const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookVideoUrl)}&show_text=false&autoplay=true`;

  return (
    <div aria-hidden={false} className="absolute inset-0 overflow-hidden">
      <iframe
        src={src}
        title="Auto Select video"
        className="absolute inset-0 size-full"
        style={{ border: 0 }}
        allow="autoplay; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/70 to-transparent" />
    </div>
  );
}
