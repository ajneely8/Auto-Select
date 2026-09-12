import "server-only";
import { loadPageviewData } from "./store";
import type { DayCount } from "@/lib/crm/leads";

function dayKey(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function sumRange(byDay: Record<string, number>, startDaysAgo: number, endDaysAgoExclusive: number): number {
  let sum = 0;
  for (let i = startDaysAgo; i < endDaysAgoExclusive; i++) sum += byDay[dayKey(i)] ?? 0;
  return sum;
}

/** Pageviews per calendar day for the last `days` days (including today), oldest first — feeds the trend chart. */
function dailyPageviews(byDay: Record<string, number>, days: number): DayCount[] {
  const out: DayCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, label: d.toLocaleDateString("en-US", { weekday: "short" }), count: byDay[key] ?? 0 });
  }
  return out;
}

export interface PageviewStats {
  total: number;
  today: number;
  thisMonth: number;
  last7: number;
  deltaPct: number | null;
  daily: DayCount[];
  topPaths: { path: string; count: number }[];
}

/** Website-traffic numbers for the CRM overview's "Website traffic" section. */
export async function getPageviewStats(): Promise<PageviewStats> {
  const { byDay, byPath } = await loadPageviewData();
  const total = Object.values(byDay).reduce((a, b) => a + b, 0);
  const today = byDay[dayKey(0)] ?? 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth = Object.entries(byDay)
    .filter(([date]) => date.slice(0, 7) === currentMonth)
    .reduce((sum, [, count]) => sum + count, 0);
  const last7 = sumRange(byDay, 0, 7);
  const prev7 = sumRange(byDay, 7, 14);
  const deltaPct = prev7 === 0 ? null : Math.round(((last7 - prev7) / prev7) * 100);
  const daily = dailyPageviews(byDay, 14);
  const topPaths = Object.entries(byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({ path, count }));

  return { total, today, thisMonth, last7, deltaPct, daily, topPaths };
}
