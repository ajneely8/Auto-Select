"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Phone, CarFront, BadgeDollarSign, ArrowUp } from "lucide-react";
import { business } from "@/config/business";
import { track } from "@/lib/analytics";

/** Vehicle detail pages render their own sticky action bar, so the global one hides there. */
const isVdp = (p: string) => /^\/inventory\/[^/]+$/.test(p);

export function MobileActionBar() {
  const pathname = usePathname();
  if (isVdp(pathname)) return null;
  return (
    <nav aria-label="Quick actions" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/97 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="grid grid-cols-3">
        <li>
          <a href={`tel:${business.phone.e164}`} className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-ink active:bg-surface">
            <Phone className="size-5 text-navy-700" aria-hidden /> Call
          </a>
        </li>
        <li>
          <Link href="/inventory" aria-current={pathname === "/inventory" ? "page" : undefined} className="flex h-16 flex-col items-center justify-center gap-1 border-x border-line text-xs font-semibold text-ink active:bg-surface aria-[current=page]:text-accent-text">
            <CarFront className="size-5 text-navy-700" aria-hidden /> Inventory
          </Link>
        </li>
        <li>
          <Link href="/financing#apply" onClick={() => track("financing_clicked", { location: "mobile_bar" })} className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-ink active:bg-surface">
            <BadgeDollarSign className="size-5 text-accent-text" aria-hidden /> Apply
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 1400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className="fixed left-4 bottom-[calc(5.25rem+var(--tray-h,0px))] lg:bottom-[calc(1.5rem+var(--tray-h,0px))] z-30 inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-white text-ink shadow-[var(--shadow-raised)] hover:border-ink animate-fade-in"
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" aria-hidden />
    </button>
  );
}

/**
 * Captures UTM parameters + original referrer once per session (for lead attribution),
 * and tracks phone / directions clicks site-wide without adding handlers to every link.
 */
export function AttributionAndClicks() {
  useEffect(() => {
    try {
      if (!sessionStorage.getItem("as_attribution")) {
        const p = new URLSearchParams(location.search);
        const data: Record<string, string> = { _referrer: document.referrer.startsWith(location.origin) ? "" : document.referrer };
        for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
          const v = p.get(k);
          if (v) data[k] = v.slice(0, 80);
        }
        sessionStorage.setItem("as_attribution", JSON.stringify(data));
      }
    } catch {}
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("phone_clicked", { location: location.pathname });
      else if (a.dataset.track === "directions" || href.includes("google.com/maps/dir")) track("directions_clicked", { location: location.pathname });
      else if (href.includes("700dealer.com")) track("financing_clicked", { location: location.pathname, source: "application_link" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
