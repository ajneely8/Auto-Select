import "server-only";
import { getAllVehicles } from "@/lib/inventory/repository";
import { listLeads } from "@/lib/crm/leads";
import { loadPageviewData, type TrafficSource } from "@/lib/pageviews/store";
import { vehicleFullName, displayPrice } from "@/lib/format";
import type { Lead, LeadType, Vehicle } from "@/lib/types";

/**
 * Listing Performance data layer: joins live inventory, first-party engagement counts, and the
 * lead store into one per-vehicle view of how each listing is actually doing.
 *
 * Every number here is measured. Metrics the site genuinely cannot observe (search impressions,
 * time-on-listing, phone-call attribution) are deliberately absent rather than estimated — see
 * UNTRACKED_METRICS, which the UI surfaces so staff know what isn't being counted.
 */

export const UNTRACKED_METRICS = [
  { label: "Search impressions", why: "Needs Google Search Console — the site can't see impressions it didn't serve." },
  { label: "Time on listing", why: "Would need per-visit timing; only page opens are counted today." },
  { label: "Phone-call attribution", why: "Calls go straight to the dealership line, so they aren't linked to a listing." },
] as const;

export type PerformanceBand = "high" | "average" | "low";

export interface ListingRow {
  stockNumber: string;
  vehicleId: string;
  slug: string;
  title: string;
  trim: string | null;
  photo: string | null;
  status: Vehicle["status"];
  price: number | null;
  daysListed: number;
  views: number;
  clicks: number;
  uniqueVisitors: number;
  leads: number;
  conversionRate: number | null;
  testDrives: number;
  deals: number;
  sales: number;
  performance: PerformanceBand;
  needsAttention: boolean;
  leadsByType: { type: LeadType; count: number }[];
}

export interface DayPoint {
  date: string;
  label: string;
  views: number;
  clicks: number;
  leads: number;
}

export interface FunnelStage {
  label: string;
  value: number;
  /** Share of the first stage. */
  pctOfTop: number;
  /** Share lost versus the stage above. null on the first stage. */
  dropOff: number | null;
  hint: string;
}

export interface ListingSummary {
  views: number;
  clicks: number;
  uniqueVisitors: number;
  leads: number;
  clickToLeadRate: number | null;
  testDrives: number;
  sales: number;
}

export interface ListingPerformance {
  rows: ListingRow[];
  summary: ListingSummary;
  previous: ListingSummary;
  timeseries: DayPoint[];
  funnel: FunnelStage[];
  sources: { source: TrafficSource; label: string; views: number }[];
  rangeDays: number;
  from: string;
  to: string;
  trackingSince: string | null;
}

const SOURCE_LABELS: Record<TrafficSource, string> = {
  organic: "Organic search",
  paid: "Paid search",
  direct: "Direct",
  social: "Social media",
  email: "Email campaigns",
  referral: "Referral sites",
  marketplace: "Marketplaces",
};

function dayKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/** Does this lead belong to this vehicle? Leads reference it by id, and sometimes by stock number. */
function leadMatchesVehicle(lead: Lead, v: Vehicle): boolean {
  if (lead.vehicleId && lead.vehicleId === v.id) return true;
  const stock = (lead.details as Record<string, unknown> | undefined)?.stockNumber;
  return typeof stock === "string" && stock.toUpperCase() === v.stockNumber.toUpperCase();
}

const emptySummary = (): ListingSummary => ({ views: 0, clicks: 0, uniqueVisitors: 0, leads: 0, clickToLeadRate: null, testDrives: 0, sales: 0 });

export interface RangeOption {
  /** Inclusive "YYYY-MM-DD" bounds. Defaults to the last 30 days ending today. */
  from?: string;
  to?: string;
}

const shiftDay = (day: string, delta: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};

/**
 * Builds the whole page's data for the given window, plus the equally sized window immediately
 * before it for period-over-period comparison.
 */
export async function getListingPerformance(range_: RangeOption = {}): Promise<ListingPerformance> {
  const [vehicles, leads, engagement] = await Promise.all([getAllVehicles(), listLeads(), loadPageviewData()]);

  const to = range_.to ?? dayKey(0);
  const from = range_.from ?? dayKey(29);
  const range = daysBetween(from, to);
  const days = range.length;
  const prevRange = daysBetween(shiftDay(from, -days), shiftDay(from, -1));
  const inRange = new Set(range);
  const inPrev = new Set(prevRange);

  const realLeads = leads.filter((l) => l.status !== "spam");
  const leadsInRange = realLeads.filter((l) => inRange.has(l.createdAt.slice(0, 10)));
  const leadsInPrev = realLeads.filter((l) => inPrev.has(l.createdAt.slice(0, 10)));

  const rows: ListingRow[] = vehicles.map((v) => {
    const perDay = engagement.vehicles[v.stockNumber] ?? {};
    let views = 0;
    let clicks = 0;
    const visitors = new Set<string>();
    for (const day of range) {
      const d = perDay[day];
      if (!d) continue;
      views += d.v;
      clicks += d.c;
      for (const id of d.u) visitors.add(id);
    }

    const mine = leadsInRange.filter((l) => leadMatchesVehicle(l, v));
    const byType = new Map<LeadType, number>();
    for (const l of mine) byType.set(l.type, (byType.get(l.type) ?? 0) + 1);

    const listed = Date.parse(`${v.dateAdded}T00:00:00Z`);
    const daysListed = Number.isFinite(listed) ? Math.max(0, Math.round((Date.now() - listed) / 86_400_000)) : 0;

    return {
      stockNumber: v.stockNumber,
      vehicleId: v.id,
      slug: v.slug,
      title: vehicleFullName(v),
      trim: v.trim,
      photo: v.photos[0]?.url ?? null,
      status: v.status,
      price: displayPrice(v),
      daysListed,
      views,
      clicks,
      uniqueVisitors: visitors.size,
      leads: mine.length,
      conversionRate: clicks > 0 ? (mine.length / clicks) * 100 : null,
      testDrives: mine.filter((l) => l.type === "test-drive").length,
      deals: mine.filter((l) => l.status === "qualified").length,
      sales: v.status === "sold" ? 1 : 0,
      performance: "average" as PerformanceBand,
      needsAttention: false,
      leadsByType: [...byType.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count })),
    };
  });

  // Bands are relative to this dealership's own numbers — a "good" listing at a 13-car lot is not
  // the same as at a 500-car lot, and fixed thresholds would mislabel everything at low volume.
  const engaged = rows.filter((r) => r.views + r.clicks > 0);
  const medianViews = median(engaged.map((r) => r.views));
  const avgConversion = (() => {
    const totalClicks = rows.reduce((n, r) => n + r.clicks, 0);
    const totalLeads = rows.reduce((n, r) => n + r.leads, 0);
    return totalClicks > 0 ? (totalLeads / totalClicks) * 100 : null;
  })();

  for (const r of rows) {
    const aboveAverageConversion = r.conversionRate != null && avgConversion != null && r.conversionRate >= avgConversion;
    if (r.leads > 0 && (aboveAverageConversion || avgConversion == null)) r.performance = "high";
    else if (r.leads === 0 && r.views >= Math.max(medianViews, 3)) r.performance = "low";
    // Getting real interest but converting nobody — the listings worth fixing first.
    r.needsAttention = r.leads === 0 && r.clicks >= Math.max(median(engaged.map((x) => x.clicks)), 3);
  }

  // Distinct across the whole range, not a sum of per-vehicle counts — one person who opened
  // three listings is one visitor, not three.
  const listingVisitors = new Set<string>();
  for (const v of vehicles) {
    const perDay = engagement.vehicles[v.stockNumber] ?? {};
    for (const day of range) for (const id of perDay[day]?.u ?? []) listingVisitors.add(id);
  }

  const summary = summarize(rows, leadsInRange, listingVisitors.size);
  const previous = previousSummary(vehicles, engagement, prevRange, leadsInPrev);

  const timeseries: DayPoint[] = range.map((date) => {
    let views = 0;
    let clicks = 0;
    for (const perDay of Object.values(engagement.vehicles)) {
      const d = perDay[date];
      if (!d) continue;
      views += d.v;
      clicks += d.c;
    }
    return {
      date,
      label: new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: views || (engagement.byDay[date] ?? 0),
      clicks,
      leads: leadsInRange.filter((l) => l.createdAt.slice(0, 10) === date).length,
    };
  });

  const siteViews = range.reduce((n, d) => n + (engagement.byDay[d] ?? 0), 0);
  const siteVisitors = new Set<string>();
  for (const d of range) for (const id of engagement.siteVisitors[d] ?? []) siteVisitors.add(id);

  const funnel = buildFunnel({
    siteViews,
    listingViews: summary.views,
    listingVisitors: listingVisitors.size,
    leads: summary.leads,
    testDrives: summary.testDrives,
    deals: rows.reduce((n, r) => n + r.deals, 0),
    sales: summary.sales,
  });

  const sourceTotals = new Map<TrafficSource, number>();
  for (const d of range) {
    for (const [source, count] of Object.entries(engagement.sources[d] ?? {})) {
      sourceTotals.set(source as TrafficSource, (sourceTotals.get(source as TrafficSource) ?? 0) + (count ?? 0));
    }
  }

  const trackedDays = Object.keys(engagement.byDay).sort();

  return {
    rows: rows.sort((a, b) => b.leads - a.leads || b.views - a.views),
    summary,
    previous,
    timeseries,
    funnel,
    sources: [...sourceTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([source, views]) => ({ source, label: SOURCE_LABELS[source], views })),
    rangeDays: days,
    from,
    to,
    trackingSince: trackedDays[0] ?? null,
  };
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function summarize(rows: ListingRow[], leadsInRange: Lead[], uniqueVisitors: number): ListingSummary {
  const views = rows.reduce((n, r) => n + r.views, 0);
  const clicks = rows.reduce((n, r) => n + r.clicks, 0);
  const leads = leadsInRange.length;
  return {
    views,
    clicks,
    uniqueVisitors,
    leads,
    clickToLeadRate: clicks > 0 ? (leads / clicks) * 100 : null,
    testDrives: leadsInRange.filter((l) => l.type === "test-drive").length,
    sales: rows.reduce((n, r) => n + r.sales, 0),
  };
}

function previousSummary(
  vehicles: Vehicle[],
  engagement: Awaited<ReturnType<typeof loadPageviewData>>,
  prevRange: string[],
  leadsInPrev: Lead[],
): ListingSummary {
  const out = emptySummary();
  const visitors = new Set<string>();
  for (const v of vehicles) {
    const perDay = engagement.vehicles[v.stockNumber] ?? {};
    for (const day of prevRange) {
      const d = perDay[day];
      if (!d) continue;
      out.views += d.v;
      out.clicks += d.c;
      for (const id of d.u) visitors.add(id);
    }
  }
  out.uniqueVisitors = visitors.size;
  out.leads = leadsInPrev.length;
  out.testDrives = leadsInPrev.filter((l) => l.type === "test-drive").length;
  out.clickToLeadRate = out.clicks > 0 ? (out.leads / out.clicks) * 100 : null;
  return out;
}

/**
 * Each stage is a genuine subset of the one above it, so the drop-off percentages mean something.
 * Vehicle clicks deliberately aren't a stage: a listing can also be reached directly or from a
 * search engine, so clicks aren't a strict superset of views and would break the arithmetic.
 */
function buildFunnel(n: {
  siteViews: number;
  listingViews: number;
  listingVisitors: number;
  leads: number;
  testDrives: number;
  deals: number;
  sales: number;
}): FunnelStage[] {
  const raw = [
    { label: "Site visits", value: n.siteViews, hint: "Any page opened on autoselectgroups.com." },
    { label: "Listing views", value: n.listingViews, hint: "A vehicle's full listing page was opened." },
    { label: "People who viewed a listing", value: n.listingVisitors, hint: "Distinct browsers that opened at least one listing." },
    { label: "Leads", value: n.leads, hint: "Form, chat, or booking submitted." },
    { label: "Test drives", value: n.testDrives, hint: "Test-drive requests." },
    { label: "Deals", value: n.deals, hint: "Leads marked Qualified in the CRM." },
    { label: "Sold", value: n.sales, hint: "Vehicles now marked sold." },
  ];
  const top = raw[0].value || 1;
  return raw.map((stage, i) => ({
    ...stage,
    pctOfTop: (stage.value / top) * 100,
    dropOff: i === 0 ? null : raw[i - 1].value > 0 ? ((raw[i - 1].value - stage.value) / raw[i - 1].value) * 100 : null,
  }));
}
