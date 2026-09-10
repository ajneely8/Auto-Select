"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fades [data-reveal] elements in once as they enter the viewport (≤300ms, never re-animates).
 * Opt-in via a class on <html>, so content is fully visible without JS or with reduced motion.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    root.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    const vh = window.innerHeight;
    document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => {
      // Anything already on screen at load is shown immediately — never delay above-the-fold content.
      if (el.getBoundingClientRect().top < vh) el.setAttribute("data-revealed", "");
      else io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
