import type { Lead, LeadStatus, LeadType } from "@/lib/types";
import { LEAD_LABELS, SENSITIVE_FIELDS } from "@/lib/leads/schemas";
import { formatPhone } from "@/lib/leads/sanitize";

export { LEAD_LABELS };

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
  spam: "Spam",
};

export const STATUS_ORDER: LeadStatus[] = ["new", "contacted", "qualified", "closed", "spam"];
export const TYPE_ORDER: LeadType[] = [
  "contact",
  "availability",
  "test-drive",
  "appointment",
  "financing",
  "trade-in",
  "vehicle-locator",
  "delivery",
  "service",
  "service-contract",
  "inventory-alert",
];

/** "tradeMileage" -> "Trade mileage", "vinOrPlate" -> "Vin or plate". Generic, so new fields need no mapping. */
export function humanizeKey(key: string): string {
  const withSpaces = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  const lower = withSpaces.toLowerCase();
  const acronyms: Record<string, string> = { vin: "VIN", url: "URL", id: "ID", utm: "UTM", apr: "APR" };
  return lower
    .split(" ")
    .map((w, i) => acronyms[w] ?? (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const HIDE_KEYS = new Set(["vehicleId", "vehicleLabel", "stockNumber", "appointmentStatus", "providerReference", "photoFiles", "alertConsent", "contactConsent"]);
const BOOLEAN_YES_NO = (v: unknown) => (v === true ? "Yes" : v === false ? "No" : String(v));

export interface DetailRow {
  key: string;
  label: string;
  value: string;
  sensitive: boolean;
}

/** Flattens a lead's type-specific `details` bag into ready-to-render rows, skipping bookkeeping fields. */
export function detailRows(lead: Lead): DetailRow[] {
  const details = (lead.details ?? {}) as Record<string, unknown>;
  const rows: DetailRow[] = [];
  for (const [key, value] of Object.entries(details)) {
    if (HIDE_KEYS.has(key) || value === "" || value == null) continue;
    const display = typeof value === "boolean" ? BOOLEAN_YES_NO(value) : Array.isArray(value) ? value.join(", ") : String(value);
    rows.push({ key, label: humanizeKey(key), value: display, sensitive: SENSITIVE_FIELDS.has(key) });
  }
  return rows;
}

export function contactSummary(lead: Lead) {
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "(no name given)";
  return { name, phone: lead.phone ? formatPhone(lead.phone) : "", email: lead.email };
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatDateTime(iso).split(",")[0];
}
