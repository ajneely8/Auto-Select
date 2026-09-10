import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDir } from "@/lib/data-dir";
import type { Lead, LeadStatus, LeadType } from "@/lib/types";

/**
 * Read side of the lead store, for the internal CRM. The write side (`save`) lives in
 * src/lib/leads/store.ts; this file adds listing, status updates, and notes on top of the same
 * `leads.ndjson` file so there's exactly one place that knows the on-disk format.
 *
 * File-based and fine for a single small-business instance. Rewriting the whole file on a change
 * (rather than a database UPDATE) is deliberate and simple — see the durability note in
 * docs/CRM.md if you outgrow it or move to serverless hosting.
 */
const FILE = () => path.join(dataDir(), "leads.ndjson");

export async function listLeads(): Promise<Lead[]> {
  let raw: string;
  try {
    raw = await fs.readFile(FILE(), "utf8");
  } catch {
    return [];
  }
  const leads: Lead[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      leads.push(JSON.parse(line) as Lead);
    } catch {
      // Skip a corrupted line rather than fail the whole dashboard.
    }
  }
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLead(id: string): Promise<Lead | null> {
  const leads = await listLeads();
  return leads.find((l) => l.id === id) ?? null;
}

async function rewrite(leads: Lead[]) {
  // Oldest-first on disk so the file's natural order stays append-like.
  const body = leads
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((l) => JSON.stringify(l))
    .join("\n");
  await fs.writeFile(FILE(), body + (body ? "\n" : ""), { mode: 0o600 });
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  const leads = await listLeads();
  const target = leads.find((l) => l.id === id);
  if (!target) return false;
  target.status = status;
  await rewrite(leads);
  return true;
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await listLeads();
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  await rewrite(next);
  // Best-effort: also clear any trade-in photos uploaded for this lead. Not fatal if it's already gone.
  await fs.rm(path.join(dataDir(), "uploads", id), { recursive: true, force: true }).catch(() => {});
  return true;
}

export async function addLeadNote(id: string, text: string): Promise<boolean> {
  const trimmed = text.trim().slice(0, 2000);
  if (!trimmed) return false;
  const leads = await listLeads();
  const target = leads.find((l) => l.id === id);
  if (!target) return false;
  target.notes = [...(target.notes ?? []), { text: trimmed, at: new Date().toISOString() }];
  await rewrite(leads);
  return true;
}

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

/** Of the leads with a status set (i.e. touched at least once), the share that moved past "new". */
export function responseRate(leads: Lead[]): number | null {
  if (leads.length === 0) return null;
  const touched = leads.filter((l) => l.status !== "new" && l.status !== "spam").length;
  const eligible = leads.filter((l) => l.status !== "spam").length;
  return eligible === 0 ? null : Math.round((touched / eligible) * 100);
}
