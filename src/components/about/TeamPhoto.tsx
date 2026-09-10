"use client";

import Image from "next/image";
import { useState } from "react";

/** Renders a team member's photo, falling back to an initials monogram if the image fails to load. */
export function TeamPhoto({ photo, initials }: { photo: { url: string; alt: string }; initials: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div aria-hidden className="flex aspect-[4/5] items-center justify-center bg-navy-900 font-display text-4xl font-bold tracking-wide text-white">
        {initials}
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
      <Image src={photo.url} alt={photo.alt} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw" className="object-cover object-top" onError={() => setFailed(true)} />
    </div>
  );
}
