import "server-only";
import { env } from "@/config/env";
import type { Lead, LeadStatus, LeadType } from "@/lib/types";
import { fileLeadStore } from "./store/file";
import { blobLeadStore } from "./store/blobs";

/**
 * Read/write side of the lead store, for the internal CRM. The write side that new form
 * submissions use (`save`) lives in src/lib/leads/store.ts and points at the same backend.
 *
 * Which backend is live is picked by `LEAD_STORE`: "file" (default, for local dev/VPS) or
 * "netlify-blobs" (durable persistence when the site is deployed on Netlify — see
 * ./store/blobs.ts and the durability note in docs/CRM.md).
 */
const backend = env.LEAD_STORE === "netlify-blobs" ? blobLeadStore : fileLeadStore;

export const listLeads = backend.listLeads;
export const getLead = backend.getLead;
export const updateLeadStatus = backend.updateLeadStatus;
export const deleteLead = backend.deleteLead;
export const addLeadNote = backend.addLeadNote;

export interface LeadCounts {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byType: Partial<Record<LeadType, number>>;
}

export function summarize(leads: Lead[]): LeadCounts {
  const byStatus: Record<LeadStatus, number> = { new: 0, contacted: 0, qualified: 0, closed: 0, spam: 0 };
  const byType: Partial<Record<LeadType, number>> = {};
  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
    byType[l.type] = (byType[l.type] ?? 0) + 1;
  }
  return { total: leads.length, byStatus, byType };
}

/** Lead types ranked by volume, for the "Where leads come from" breakdown. Excludes types with zero leads. */
export function typeBreakdown(leads: Lead[]): { type: LeadType; count: number }[] {
  const { byType } = summarize(leads);
  return (Object.entries(byType) as [LeadType, number][]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }));
}

/** New leads that have sat untouched longer than `hours`, oldest first — the actionable "reply to these" list. */
export function needsAttention(leads: Lead[], hours = 24): Lead[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return leads.filter((l) => l.status === "new" && new Date(l.createdAt).getTime() < cutoff).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export interface DayCount {
  /** "YYYY-MM-DD", local calendar date. */
  date: string;
  label: string;
  count: number;
}

/** Lead counts per calendar day for the last `days` days (including today), oldest first — feeds the trend chart. */
export function dailyCounts(leads: Lead[], days = 14): DayCount[] {
  const counts = new Map<string, number>();
  for (const l of leads) {
    const d = l.createdAt.slice(0, 10);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const out: DayCount[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, label: d.toLocaleDateString("en-US", { weekday: "short" }), count: counts.get(key) ?? 0 });
  }
  return out;
}

export interface WeeklyTrend {
  last7: number;
  prev7: number;
  /** Percent change vs. the prior 7 days, or null when there's no prior-week baseline to compare against. */
  deltaPct: number | null;
}

/** Lead volume this week vs. the week before, for the "Last 7 days" stat card's trend arrow. */
export function weeklyTrend(leads: Lead[]): WeeklyTrend {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  let last7 = 0;
  let prev7 = 0;
  for (const l of leads) {
    const age = now - new Date(l.createdAt).getTime();
    if (age < 7 * DAY_MS) last7++;
    else if (age < 14 * DAY_MS) prev7++;
  }
  const deltaPct = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);
  return { last7, prev7, deltaPct };
}

/** "YYYY-MM" for a lead's createdAt — the grouping key for monthly history. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** "YYYY-MM" -> "September 2026". */
export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Leads created in the current calendar month, for the "This month" stat card. */
export function thisMonthCount(leads: Lead[]): number {
  const current = monthKey(new Date().toISOString());
  return leads.filter((l) => monthKey(l.createdAt) === current).length;
}

export interface MonthCount {
  /** "YYYY-MM" */
  key: string;
  label: string;
  count: number;
}

/**
 * Every calendar month that has at least one lead (plus the current month, even if empty), most
 * recent first — the archive so nothing gets lost once a month ends, just filtered out of view.
 */
export function monthlyHistory(leads: Lead[]): MonthCount[] {
  const counts = new Map<string, number>();
  counts.set(monthKey(new Date().toISOString()), 0);
  for (const l of leads) {
    const key = monthKey(l.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, count]) => ({ key, label: monthLabel(key), count }));
}

/** Of the leads with a status set (i.e. touched at least once), the share that moved past "new". */
export function responseRate(leads: Lead[]): number | null {
  if (leads.length === 0) return null;
  const touched = leads.filter((l) => l.status !== "new" && l.status !== "spam").length;
  const eligible = leads.filter((l) => l.status !== "spam").length;
  return eligible === 0 ? null : Math.round((touched / eligible) * 100);
}
