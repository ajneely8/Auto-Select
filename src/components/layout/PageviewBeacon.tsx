"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires a first-party pageview beacon on first load and every client-side route change, so the
 * CRM's "Website traffic" section reflects real visits. No cookies, no third-party script.
 */
export function PageviewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const body = JSON.stringify({ path: pathname });
      const sent = navigator.sendBeacon?.("/api/pageview", new Blob([body], { type: "application/json" }));
      if (!sent) {
        fetch("/api/pageview", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    } catch {
      /* pageview tracking must never break navigation */
    }
  }, [pathname]);

  return null;
}
