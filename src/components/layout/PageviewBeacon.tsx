"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * First-party engagement beacon: a pageview on every route change, plus a click whenever a
 * visitor opens a vehicle from the inventory grid, search results, or a card elsewhere on the
 * site. Powers the CRM's Website traffic and Listing Performance sections.
 *
 * No cookies and no personal data. A short random id is kept per browser purely so the CRM can
 * say "12 people" instead of "31 views", and so one person clicking the same listing repeatedly
 * doesn't inflate its numbers.
 */
const VISITOR_KEY = "as_vid";
const CLICK_PREFIX = "as_clk_";
const CLICK_THROTTLE_MS = 30 * 60 * 1000;

function visitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function beacon(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    const sent = navigator.sendBeacon?.("/api/pageview", new Blob([body], { type: "application/json" }));
    if (!sent) {
      fetch("/api/pageview", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* tracking must never break the page */
  }
}

export function PageviewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    beacon({
      kind: "view",
      path: pathname,
      vid: visitorId(),
      ref: document.referrer || "",
      utmMedium: params.get("utm_medium") ?? "",
      utmSource: params.get("utm_source") ?? "",
    });
  }, [pathname]);

  // Delegated click tracking: vehicle cards mark themselves with data-vehicle-click="<stock>".
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("[data-vehicle-click]");
      const stock = el?.getAttribute("data-vehicle-click");
      if (!stock) return;
      try {
        const key = CLICK_PREFIX + stock;
        const last = Number(sessionStorage.getItem(key) ?? 0);
        if (Date.now() - last < CLICK_THROTTLE_MS) return;
        sessionStorage.setItem(key, String(Date.now()));
      } catch {
        /* storage blocked — still record the click */
      }
      beacon({ kind: "click", stock, vid: visitorId() });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
