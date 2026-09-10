"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_KEY } from "@/lib/analytics";

/**
 * Shown only when NEXT_PUBLIC_ANALYTICS_REQUIRE_CONSENT=true. Declining is as easy as accepting,
 * nothing is pre-selected, and the site works fully either way. No marketing pixels are loaded by this site.
 */
export function ConsentBanner() {
  const required = process.env.NEXT_PUBLIC_ANALYTICS_REQUIRE_CONSENT === "true";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!required) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(!localStorage.getItem(CONSENT_KEY));
    } catch {}
  }, [required]);

  if (!open) return null;
  const choose = (v: "granted" | "denied") => {
    try {
      localStorage.setItem(CONSENT_KEY, v);
    } catch {}
    setOpen(false);
  };
  return (
    <div role="region" aria-label="Analytics preferences" className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-xl rounded-[var(--radius-md)] border border-line bg-white p-4 shadow-[var(--shadow-overlay)] lg:bottom-6 animate-fade-up">
      <p className="text-sm text-slate">
        We&apos;d like to use privacy-friendly, cookie-free analytics to understand which pages are helpful. We never send your name, phone, email, or financial
        details to analytics.{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2">
          Learn more
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => choose("denied")} className="min-h-11 flex-1 rounded-[var(--radius-sm)] border border-line-strong px-4 text-sm font-semibold text-ink hover:border-ink">
          Decline
        </button>
        <button type="button" onClick={() => choose("granted")} className="min-h-11 flex-1 rounded-[var(--radius-sm)] bg-navy-900 px-4 text-sm font-semibold text-white hover:bg-navy-800">
          Allow analytics
        </button>
      </div>
    </div>
  );
}
