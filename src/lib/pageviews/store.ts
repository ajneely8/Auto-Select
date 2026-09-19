import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDir } from "@/lib/data-dir";

/**
 * First-party engagement counter — no cookies, no third party, no personal data. Stores aggregate
 * counts only, plus short random per-browser ids used purely to deduplicate visitors and to stop
 * one person refreshing a listing from inflating its numbers. Nothing here identifies a person.
 *
 * Vehicle engagement is keyed by STOCK NUMBER rather than URL, because a listing's slug changes
 * whenever DealerCenter's trim text changes (the Sprinter and Tundra each had views split across
 * two slugs before this) — stock numbers are stable for the life of the vehicle.
 */
export type TrafficSource = "organic" | "paid" | "direct" | "social" | "email" | "referral" | "marketplace";

/** Per-day engagement for one vehicle. Short keys keep the file small at high traffic. */
export interface VehicleDay {
  /** Listing-page views. */
  v: number;
  /** Clicks through to the listing from inventory/search/cards. */
  c: number;
  /** Distinct visitor ids seen that day (deduplicated). */
  u: string[];
}

export interface PageviewData {
  byDay: Record<string, number>;
  byPath: Record<string, number>;
  vehicles: Record<string, Record<string, VehicleDay>>;
  sources: Record<string, Partial<Record<TrafficSource, number>>>;
  siteVisitors: Record<string, string[]>;
}

/** Keep the file bounded: drop days older than this, and cap ids stored per day. */
const RETAIN_DAYS = 120;
const MAX_IDS_PER_DAY = 5000;

let chain: Promise<unknown> = Promise.resolve();
function withPageviewsFileLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(() => undefined, () => undefined);
  return run;
}

function filePath() {
  return path.join(dataDir(), "pageviews.json");
}

function empty(): PageviewData {
  return { byDay: {}, byPath: {}, vehicles: {}, sources: {}, siteVisitors: {} };
}

async function readData(): Promise<PageviewData> {
  try {
    const raw = await fs.readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<PageviewData>;
    return {
      byDay: parsed.byDay ?? {},
      byPath: parsed.byPath ?? {},
      vehicles: parsed.vehicles ?? {},
      sources: parsed.sources ?? {},
      siteVisitors: parsed.siteVisitors ?? {},
    };
  } catch {
    return empty();
  }
}

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

function cutoff(): string {
  const d = new Date();
  d.setDate(d.getDate() - RETAIN_DAYS);
  return dayKey(d);
}

/** Drops days that have aged out, so the file doesn't grow without bound. */
function prune(data: PageviewData) {
  const oldest = cutoff();
  for (const day of Object.keys(data.byDay)) if (day < oldest) delete data.byDay[day];
  for (const day of Object.keys(data.sources)) if (day < oldest) delete data.sources[day];
  for (const day of Object.keys(data.siteVisitors)) if (day < oldest) delete data.siteVisitors[day];
  for (const [stock, days] of Object.entries(data.vehicles)) {
    for (const day of Object.keys(days)) if (day < oldest) delete days[day];
    if (Object.keys(days).length === 0) delete data.vehicles[stock];
  }
}

function addVisitor(list: string[], visitorId: string): boolean {
  if (!visitorId || list.includes(visitorId)) return false;
  if (list.length < MAX_IDS_PER_DAY) list.push(visitorId);
  return true;
}

export interface EngagementEvent {
  kind: "view" | "click";
  /** Normalized pathname, only recorded for views. */
  pathname?: string;
  /** Stock number, when the event belongs to a specific vehicle listing. */
  stock?: string | null;
  /** Short random per-browser id. Not personal data, not linked to any lead. */
  visitorId?: string;
  source?: TrafficSource;
}

/**
 * Records one engagement event. Safe to call fire-and-forget from the beacon endpoint —
 * everything is bounded and failures never surface to the visitor.
 */
export async function recordEngagement(event: EngagementEvent): Promise<void> {
  await withPageviewsFileLock(async () => {
    const data = await readData();
    const today = dayKey();
    const visitorId = (event.visitorId ?? "").slice(0, 24);

    if (event.kind === "view") {
      data.byDay[today] = (data.byDay[today] ?? 0) + 1;
      if (event.pathname) data.byPath[event.pathname] = (data.byPath[event.pathname] ?? 0) + 1;
      if (event.source) {
        const day = (data.sources[today] ??= {});
        day[event.source] = (day[event.source] ?? 0) + 1;
      }
      addVisitor((data.siteVisitors[today] ??= []), visitorId);
    }

    if (event.stock) {
      const byDay = (data.vehicles[event.stock] ??= {});
      const entry = (byDay[today] ??= { v: 0, c: 0, u: [] });
      if (event.kind === "view") entry.v += 1;
      else entry.c += 1;
      addVisitor(entry.u, visitorId);
    }

    prune(data);
    await fs.mkdir(dataDir(), { recursive: true });
    await fs.writeFile(filePath(), JSON.stringify(data), { mode: 0o600 });
  });
}

export async function loadPageviewData(): Promise<PageviewData> {
  return readData();
}
