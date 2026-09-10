/**
 * Privacy-conscious analytics abstraction (client-side).
 *
 * - Only whitelisted, non-personal properties are sent. Names, emails, phone numbers, VINs,
 *   financial amounts, and free text are dropped even if a caller passes them by mistake.
 * - Destination: Plausible-compatible `window.plausible` if loaded, and/or a first-party endpoint
 *   (NEXT_PUBLIC_ANALYTICS_ENDPOINT) via sendBeacon. Nothing is sent otherwise.
 * - If NEXT_PUBLIC_ANALYTICS_REQUIRE_CONSENT=true, events are sent only after the visitor opts in.
 */
export type AnalyticsEvent =
  | "inventory_search"
  | "filter_applied"
  | "vehicle_view"
  | "gallery_opened"
  | "vehicle_360_started"
  | "financing_clicked"
  | "trade_in_started"
  | "form_started"
  | "form_submitted"
  | "phone_clicked"
  | "directions_clicked"
  | "appointment_started"
  | "assistant_opened"
  | "assistant_question";

type Value = string | number | boolean | null | undefined;

const ALLOWED_KEYS = new Set([
  "form_type",
  "stock_number",
  "make",
  "model",
  "year",
  "body_style",
  "filter",
  "sort",
  "result_count",
  "location",
  "view",
  "photo_index",
  "frame_count",
  "success",
  "source",
]);

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
const VIN = /\b[A-HJ-NPR-Z0-9]{17}\b/i;

export function scrub(props: Record<string, Value> = {}) {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_KEYS.has(k) || v == null) continue;
    if (typeof v === "string") {
      if (EMAIL.test(v) || PHONE.test(v) || VIN.test(v)) continue;
      out[k] = v.slice(0, 80);
    } else out[k] = v;
  }
  return out;
}

export const CONSENT_KEY = "as_analytics_consent";

export function analyticsAllowed() {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_ANALYTICS_REQUIRE_CONSENT !== "true") return true;
  try {
    return localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export function track(event: AnalyticsEvent, props?: Record<string, Value>) {
  if (typeof window === "undefined" || !analyticsAllowed()) return;
  const clean = scrub(props);
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, clean);
  try {
    window.plausible?.(event, { props: clean });
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    if (endpoint) {
      const body = JSON.stringify({ event, props: clean, path: location.pathname, ts: Date.now() });
      navigator.sendBeacon?.(endpoint, new Blob([body], { type: "application/json" }));
    }
  } catch {
    /* analytics must never break the page */
  }
}
