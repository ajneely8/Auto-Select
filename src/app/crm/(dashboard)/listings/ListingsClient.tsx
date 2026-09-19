"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  Info,
  Loader2,
  MousePointerClick,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import type { ListingPerformance, ListingRow, PerformanceBand } from "@/lib/crm/listings";
import { LEAD_LABELS } from "@/lib/crm/format";
import { formatPrice } from "@/lib/format";

const CARD = "rounded-[20px] border border-white/10 bg-[#161616] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_-14px_rgba(0,0,0,0.7)]";
const FIELD =
  "h-10 w-full min-w-0 rounded-[var(--radius-sm)] border border-white/15 bg-white/5 px-3 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/25 [color-scheme:dark] sm:w-auto";
const PAGE_SIZE = 10;

const today = () => new Date().toISOString().slice(0, 10);
const shift = (day: string, delta: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};
const monthStart = (offset = 0) => {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + offset);
  return d.toISOString().slice(0, 10);
};

const num = (n: number) => n.toLocaleString("en-US");
const pct = (n: number | null, digits = 1) => (n == null ? "—" : `${n.toFixed(digits)}%`);

/** A metric definition shown on hover/focus, so staff know exactly what each number counts. */
function Tip({ text }: { text: string }) {
  return (
    <span tabIndex={0} title={text} aria-label={text} className="inline-flex cursor-help align-middle text-white/35 focus:outline-none focus-visible:text-lime-300">
      <Info className="size-3" aria-hidden />
    </span>
  );
}

function Delta({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  if (previous === 0 && current === 0) return <p className="mt-1 text-xs text-white/35">No data last period</p>;
  if (previous === 0) return <p className="mt-1 text-xs font-medium text-lime-300">New this period</p>;
  const change = ((current - previous) / previous) * 100;
  const up = change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${up ? "text-lime-300" : "text-[#f2777a]"}`}>
      <Icon className="size-3.5" aria-hidden />
      {up ? "+" : ""}
      {change.toFixed(1)}% {suffix || "vs. previous period"}
    </p>
  );
}

const STATUS_STYLE: Record<string, string> = {
  available: "border-lime-400/30 bg-lime-400/10 text-lime-300",
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  sold: "border-white/15 bg-white/5 text-white/60",
  "in-transit": "border-sky-400/30 bg-sky-400/10 text-sky-300",
};
const STATUS_LABEL: Record<string, string> = { available: "Live", pending: "Reserved", sold: "Sold", "in-transit": "In transit" };

const PERF_STYLE: Record<PerformanceBand, string> = {
  high: "border-lime-400/40 bg-lime-400/10 text-lime-300",
  average: "border-white/15 bg-white/5 text-white/70",
  low: "border-[#f2777a]/30 bg-[#f2777a]/10 text-[#f2777a]",
};

type SortKey = "views" | "clicks" | "uniqueVisitors" | "leads" | "conversionRate" | "testDrives" | "daysListed";

export function ListingsClient({ data }: { data: ListingPerformance }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [perf, setPerf] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "leads", dir: "desc" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<ListingRow | null>(null);
  const [page, setPage] = useState(1);

  const setRange = (from: string, to: string) => {
    startTransition(() => router.push(`/crm/listings?from=${from}&to=${to}`, { scroll: false }));
  };

  const presets = [
    { label: "Today", from: today(), to: today() },
    { label: "Last 7 days", from: shift(today(), -6), to: today() },
    { label: "Last 30 days", from: shift(today(), -29), to: today() },
    { label: "This month", from: monthStart(), to: today() },
    { label: "Last month", from: monthStart(-1), to: shift(monthStart(), -1) },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data.rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (perf === "attention" ? !r.needsAttention : perf !== "all" && r.performance !== perf) return false;
      if (!q) return true;
      return `${r.title} ${r.trim ?? ""} ${r.stockNumber}`.toLowerCase().includes(q);
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key] ?? -1;
      const bv = b[sort.key] ?? -1;
      return sort.dir === "desc" ? Number(bv) - Number(av) : Number(av) - Number(bv);
    });
    return rows;
  }, [data.rows, query, status, perf, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const best = data.rows.find((r) => r.leads > 0) ?? null;

  function toggleSort(key: SortKey) {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));
    setPage(1);
  }

  function exportCsv() {
    const header = ["Stock", "Vehicle", "Trim", "Status", "Price", "Days listed", "Views", "Clicks", "Unique visitors", "Leads", "Conversion %", "Test drives", "Deals", "Sold", "Performance"];
    const lines = filtered.map((r) =>
      [r.stockNumber, r.title, r.trim ?? "", STATUS_LABEL[r.status] ?? r.status, r.price ?? "", r.daysListed, r.views, r.clicks, r.uniqueVisitors, r.leads, r.conversionRate?.toFixed(1) ?? "", r.testDrives, r.deals, r.sales, r.performance]
        .map((v) => {
          const s = String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `listing-performance-${data.from}-to-${data.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const noData = data.summary.views === 0 && data.summary.clicks === 0 && data.summary.leads === 0;

  return (
    <div className="grid gap-6">
      {/* ── Header ── */}
      <div className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Listing Performance</h1>
            <p className="mt-1 text-sm text-white/50">Track vehicle engagement, lead generation, and conversion.</p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-white/15 px-3.5 text-sm font-semibold text-white transition-colors hover:border-lime-400/40 hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="size-4" aria-hidden /> Export report
          </button>
        </div>

        <div className={`${CARD} flex flex-wrap items-center gap-2 p-3`}>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Date range presets">
            {presets.map((p) => {
              const active = data.from === p.from && data.to === p.to;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setRange(p.from, p.to)}
                  aria-pressed={active}
                  className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors ${
                    active ? "border-lime-400 bg-lime-400 text-black shadow-[0_0_16px_0_rgba(163,230,53,0.3)]" : "border-white/15 text-white/70 hover:border-white/35 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/45">
            <label className="sr-only" htmlFor="from">
              From
            </label>
            <input id="from" type="date" value={data.from} max={data.to} onChange={(e) => setRange(e.target.value, data.to)} className={`${FIELD} h-9`} />
            <span aria-hidden>→</span>
            <label className="sr-only" htmlFor="to">
              To
            </label>
            <input id="to" type="date" value={data.to} min={data.from} max={today()} onChange={(e) => setRange(data.from, e.target.value)} className={`${FIELD} h-9`} />
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search vehicle or stock…"
                aria-label="Search listings"
                className={`${FIELD} h-9 w-48 pl-8`}
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by listing status" className={`${FIELD} h-9`}>
              <option value="all" className="bg-[#161616]">
                All statuses
              </option>
              {["available", "pending", "in-transit", "sold"].map((s) => (
                <option key={s} value={s} className="bg-[#161616]">
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <select value={perf} onChange={(e) => setPerf(e.target.value)} aria-label="Filter by performance" className={`${FIELD} h-9`}>
              <option value="all" className="bg-[#161616]">
                All performance
              </option>
              <option value="high" className="bg-[#161616]">
                High performers
              </option>
              <option value="average" className="bg-[#161616]">
                Average
              </option>
              <option value="low" className="bg-[#161616]">
                Low
              </option>
              <option value="attention" className="bg-[#161616]">
                Needs attention
              </option>
            </select>
            {pending && <Loader2 className="size-4 animate-spin text-lime-300" aria-label="Loading" />}
          </div>
        </div>
      </div>

      {noData ? (
        <div className={`${CARD} p-10 text-center`}>
          <p className="font-display text-lg font-bold text-white">No engagement recorded in this range</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
            {data.trackingSince ? `Tracking started ${data.trackingSince}. Pick a range that includes it, or widen the dates.` : "Tracking hasn't recorded anything yet. Numbers appear here as visitors browse the site."}
          </p>
        </div>
      ) : (
        <>
          {/* ── KPI cards ── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Listing views" tip="A visitor opened a vehicle's full listing page." value={num(data.summary.views)} current={data.summary.views} previous={data.previous.views} icon={Eye} />
            <Kpi label="Vehicle clicks" tip="A visitor clicked through to a vehicle from inventory, search, or a card. Repeat clicks from the same browser within 30 minutes aren't counted." value={num(data.summary.clicks)} current={data.summary.clicks} previous={data.previous.clicks} icon={MousePointerClick} />
            <Kpi label="Unique visitors" tip="Distinct browsers that viewed a listing in this range." value={num(data.summary.uniqueVisitors)} current={data.summary.uniqueVisitors} previous={data.previous.uniqueVisitors} icon={Users} />
            <Kpi label="Leads generated" tip="Forms, chats, and booking requests submitted in this range, excluding spam." value={num(data.summary.leads)} current={data.summary.leads} previous={data.previous.leads} />
            <Kpi label="Click-to-lead rate" tip="Leads divided by vehicle clicks." value={pct(data.summary.clickToLeadRate)} current={data.summary.clickToLeadRate ?? 0} previous={data.previous.clickToLeadRate ?? 0} />
            <Kpi label="Test drives booked" tip="Test-drive requests submitted in this range." value={num(data.summary.testDrives)} current={data.summary.testDrives} previous={data.previous.testDrives} />
          </div>

          {/* ── Trend + funnel ── */}
          <div className="grid gap-6 xl:grid-cols-3">
            <section aria-labelledby="trend-heading" className={`${CARD} min-w-0 p-5 xl:col-span-2`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="trend-heading" className="font-display text-lg font-bold text-white">
                  Clicks and leads over time
                </h2>
                <div className="flex items-center gap-4 text-xs text-white/55">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded bg-lime-400" aria-hidden /> Clicks
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-4 rounded bg-white" aria-hidden /> Leads
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded bg-white/10" aria-hidden /> Views
                  </span>
                </div>
              </div>
              <TrendChart data={data} />
            </section>

            <section aria-labelledby="funnel-heading" className={`${CARD} min-w-0 p-5`}>
              <h2 id="funnel-heading" className="font-display text-lg font-bold text-white">
                Listing conversion funnel
              </h2>
              <p className="mt-0.5 text-xs text-white/45">Drop-off at each step</p>
              <ul className="mt-4 grid gap-2.5">
                {data.funnel.map((stage) => (
                  <li key={stage.label}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-white/80">
                        {stage.label} <Tip text={stage.hint} />
                      </span>
                      <span className="tabular font-semibold text-white">{num(stage.value)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-lime-400" style={{ width: `${Math.max(stage.pctOfTop, stage.value > 0 ? 2 : 0)}%` }} />
                    </div>
                    <p className="mt-0.5 text-[0.6875rem] text-white/40">
                      {stage.pctOfTop.toFixed(1)}% of site visits
                      {stage.dropOff != null && stage.dropOff > 0 ? ` · ${stage.dropOff.toFixed(0)}% drop-off` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ── Top listings + traffic sources ── */}
          <div className="grid gap-6 xl:grid-cols-3">
            <section aria-labelledby="top-heading" className={`${CARD} min-w-0 p-5 xl:col-span-2`}>
              <h2 id="top-heading" className="font-display text-lg font-bold text-white">
                Top listings by leads
              </h2>
              <p className="mt-0.5 text-xs text-white/45">Ranked by leads, then views</p>
              <ul className="mt-4 grid gap-2.5">
                {data.rows.slice(0, 10).map((r) => {
                  const max = Math.max(1, ...data.rows.map((x) => x.leads || x.views / 10));
                  const value = r.leads || r.views / 10;
                  return (
                    <li key={r.stockNumber}>
                      <button type="button" onClick={() => setDrawer(r)} className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-1 py-1 text-left hover:bg-white/5">
                        <Thumb row={r} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-sm font-medium text-white">{r.title}</span>
                            <span className="shrink-0 tabular text-xs text-white/55">
                              {r.leads} {r.leads === 1 ? "lead" : "leads"} · {pct(r.conversionRate, 0)}
                            </span>
                          </span>
                          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10">
                            <span className="block h-full rounded-full bg-lime-400" style={{ width: `${(value / max) * 100}%` }} />
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section aria-labelledby="sources-heading" className={`${CARD} min-w-0 p-5`}>
              <h2 id="sources-heading" className="font-display text-lg font-bold text-white">
                Traffic sources
              </h2>
              <p className="mt-0.5 text-xs text-white/45">Site visits by where they came from</p>
              {data.sources.length === 0 ? (
                <p className="mt-4 text-sm text-white/45">No source data in this range yet.</p>
              ) : (
                <ul className="mt-4 grid gap-3">
                  {data.sources.map((s) => {
                    const total = data.sources.reduce((n, x) => n + x.views, 0) || 1;
                    return (
                      <li key={s.source} className="grid gap-1">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate text-white/80">{s.label}</span>
                          <span className="shrink-0 tabular text-white/55">
                            {num(s.views)} · {((s.views / total) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-lime-400" style={{ width: `${(s.views / total) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* ── Table ── */}
          {/* min-w-0: grid items default to min-width:auto, which would let the wide table stretch
              the whole page instead of scrolling inside its own container. */}
          <section aria-labelledby="table-heading" className={`${CARD} min-w-0`}>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
              <h2 id="table-heading" className="font-display text-lg font-bold text-white">
                Vehicle listing performance
              </h2>
              <p className="text-xs text-white/45">
                {filtered.length} of {data.rows.length} listings
              </p>
            </div>

            {filtered.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-white/50">No listings match those filters.</p>
            ) : (
              <>
                {/* `relative` matters: absolutely-positioned descendants (the sr-only header text)
                    would otherwise escape this scroller and widen the whole page. */}
                <div className="relative mt-3 min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-sm">
                    <thead>
                      <tr className="border-y border-white/10 text-left text-xs uppercase tracking-wide text-white/45">
                        <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">
                          Vehicle
                        </th>
                        <th scope="col" className="px-3 py-2.5 font-semibold">
                          Status
                        </th>
                        <Th label="Views" tip="Listing page opens." sortKey="views" sort={sort} onSort={toggleSort} />
                        <Th label="Clicks" tip="Clicks into the listing from inventory or search." sortKey="clicks" sort={sort} onSort={toggleSort} />
                        <Th label="Unique" tip="Distinct browsers." sortKey="uniqueVisitors" sort={sort} onSort={toggleSort} />
                        <Th label="Leads" tip="Forms, chats, and bookings tied to this vehicle." sortKey="leads" sort={sort} onSort={toggleSort} />
                        <Th label="Conv." tip="Leads ÷ clicks." sortKey="conversionRate" sort={sort} onSort={toggleSort} />
                        <Th label="Drives" tip="Test-drive requests." sortKey="testDrives" sort={sort} onSort={toggleSort} />
                        <Th label="Days" tip="Days since the listing went up." sortKey="daysListed" sort={sort} onSort={toggleSort} />
                        <th scope="col" className="px-3 py-2.5 font-semibold">
                          Performance
                        </th>
                        <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((r) => {
                        const isBest = best?.stockNumber === r.stockNumber;
                        const open = expanded === r.stockNumber;
                        return (
                          <>
                            <tr
                              key={r.stockNumber}
                              className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${isBest ? "bg-lime-400/[0.04] shadow-[inset_3px_0_0_0_rgb(163,230,53)]" : ""}`}
                            >
                              <td className="py-3 pl-5 pr-3">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setExpanded(open ? null : r.stockNumber)}
                                    aria-expanded={open}
                                    aria-label={`${open ? "Hide" : "Show"} lead sources for ${r.title}`}
                                    className="rounded text-white/40 hover:text-lime-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50"
                                  >
                                    {open ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
                                  </button>
                                  <Thumb row={r} />
                                  <div className="min-w-0">
                                    <button type="button" onClick={() => setDrawer(r)} className="block max-w-[260px] truncate text-left font-semibold text-white hover:text-lime-300">
                                      {r.title}
                                    </button>
                                    <p className="truncate text-xs text-white/45">
                                      {r.trim ? `${r.trim} · ` : ""}Stock {r.stockNumber}
                                      {r.needsAttention && (
                                        <span className="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[0.625rem] font-semibold text-amber-300">Needs attention</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
                              </td>
                              <Td>{num(r.views)}</Td>
                              <Td>{num(r.clicks)}</Td>
                              <Td>{num(r.uniqueVisitors)}</Td>
                              <Td strong>{num(r.leads)}</Td>
                              <Td>{pct(r.conversionRate, 0)}</Td>
                              <Td>{num(r.testDrives)}</Td>
                              <Td>{num(r.daysListed)}</Td>
                              <td className="px-3 py-3">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${PERF_STYLE[r.performance]}`}>{r.performance}</span>
                              </td>
                              <td className="px-3 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setDrawer(r)}
                                  className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-lime-400/40 hover:text-lime-300"
                                  aria-label={`Open detailed report for ${r.title}`}
                                >
                                  <ArrowUpRight className="size-4" aria-hidden />
                                </button>
                              </td>
                            </tr>
                            {open && (
                              <tr key={`${r.stockNumber}-detail`} className="border-b border-white/5 bg-black/30">
                                <td colSpan={11} className="px-5 py-4">
                                  <LeadSources row={r} />
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {pageCount > 1 && (
                  <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <p className="text-white/45">
                      Page {current} of {pageCount}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPage(current - 1)}
                        disabled={current <= 1}
                        className="min-h-9 rounded-[var(--radius-sm)] border border-white/15 px-3 font-medium text-white/80 hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage(current + 1)}
                        disabled={current >= pageCount}
                        className="min-h-9 rounded-[var(--radius-sm)] border border-white/15 px-3 font-medium text-white/80 hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}

      {/* ── What isn't tracked — stated plainly so nobody reads a missing metric as a zero ── */}
      <section aria-labelledby="untracked-heading" className={`${CARD} p-5`}>
        <h2 id="untracked-heading" className="text-sm font-semibold text-white/80">
          Not tracked on this site
        </h2>
        <ul className="mt-2 grid gap-1.5 text-xs text-white/45 sm:grid-cols-3">
          {UNTRACKED.map((m) => (
            <li key={m.label}>
              <span className="text-white/70">{m.label}:</span> {m.why}
            </li>
          ))}
        </ul>
      </section>

      {drawer && <Drawer row={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}

const UNTRACKED = [
  { label: "Search impressions", why: "needs Google Search Console; the site can't see impressions it didn't serve." },
  { label: "Time on listing", why: "only page opens are counted today, not how long someone stayed." },
  { label: "Phone-call attribution", why: "calls reach the dealership line directly, so they aren't tied to a listing." },
];

function Kpi({
  label,
  tip,
  value,
  current,
  previous,
  icon: Icon,
}: {
  label: string;
  tip: string;
  value: string;
  current: number;
  previous: number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/50">
        {Icon && <Icon className="size-3.5" aria-hidden />}
        {label} <Tip text={tip} />
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular text-white">{value}</p>
      <Delta current={current} previous={previous} />
    </div>
  );
}

function Th({
  label,
  tip,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  tip: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (k: SortKey) => void;
}) {
  const active = sort.key === sortKey;
  return (
    <th scope="col" className="px-3 py-2.5 font-semibold" aria-sort={active ? (sort.dir === "desc" ? "descending" : "ascending") : "none"}>
      <button type="button" onClick={() => onSort(sortKey)} className={`inline-flex items-center gap-1 rounded hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50 ${active ? "text-lime-300" : ""}`}>
        {label} <Tip text={tip} />
        {active && <span aria-hidden>{sort.dir === "desc" ? "↓" : "↑"}</span>}
      </button>
    </th>
  );
}

function Td({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={`px-3 py-3 tabular ${strong ? "font-semibold text-white" : "text-white/70"}`}>{children}</td>;
}

function Thumb({ row }: { row: ListingRow }) {
  return (
    <span className="relative block h-10 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-white/10 bg-white/5">
      {row.photo ? <Image src={row.photo} alt="" fill sizes="56px" className="object-cover" /> : null}
    </span>
  );
}

function LeadSources({ row }: { row: ListingRow }) {
  if (row.leads === 0) {
    return (
      <p className="text-sm text-white/50">
        No leads yet for this listing{row.views > 0 ? ` — ${row.views} ${row.views === 1 ? "person has" : "people have"} viewed it.` : "."}{" "}
        {row.needsAttention && <span className="text-amber-300">It&apos;s getting clicks but no enquiries, so the price, photos, or description may be worth a look.</span>}
      </p>
    );
  }
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Where these leads came from</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {row.leadsByType.map((s) => (
          <li key={s.type} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-white/10 px-3 py-2 text-sm">
            <span className="truncate text-white/80">{LEAD_LABELS[s.type]}</span>
            <span className="shrink-0 tabular text-white/55">
              {s.count} · {((s.count / row.leads) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Dual-line trend with a faint view area behind it, and a hover readout. */
function TrendChart({ data }: { data: ListingPerformance }) {
  const [hover, setHover] = useState<number | null>(null);
  const points = data.timeseries;
  const w = 720;
  const h = 200;
  const padY = 16;
  const maxLine = Math.max(1, ...points.map((p) => Math.max(p.clicks, p.leads)));
  const maxArea = Math.max(1, ...points.map((p) => p.views));
  const x = (i: number) => (points.length <= 1 ? w / 2 : (i / (points.length - 1)) * w);
  const y = (v: number, max: number) => h - padY - (v / max) * (h - padY * 2);
  const line = (key: "clicks" | "leads") => points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p[key], maxLine).toFixed(1)}`).join(" ");
  const area = `M0,${h} ${points.map((p, i) => `L${x(i).toFixed(1)},${y(p.views, maxArea).toFixed(1)}`).join(" ")} L${w},${h} Z`;
  const active = hover != null ? points[hover] : null;

  return (
    <div className="relative mt-4">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Clicks and leads per day from ${data.from} to ${data.to}`}
        className="h-48 w-full"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rel = ((e.clientX - rect.left) / rect.width) * w;
          setHover(Math.max(0, Math.min(points.length - 1, Math.round((rel / w) * (points.length - 1)))));
        }}
      >
        <path d={area} fill="rgba(255,255,255,0.07)" />
        <path d={line("clicks")} fill="none" stroke="#a3e635" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={line("leads")} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {active && hover != null && (
          <>
            <line x1={x(hover)} y1={0} x2={x(hover)} y2={h} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(active.clicks, maxLine)} r="4" fill="#a3e635" />
            <circle cx={x(hover)} cy={y(active.leads, maxLine)} r="4" fill="#fff" />
          </>
        )}
      </svg>
      <div className="mt-1 flex justify-between text-[0.6875rem] text-white/35">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
      {active && (
        <div className="pointer-events-none absolute right-2 top-0 rounded-[var(--radius-sm)] border border-white/15 bg-black/85 px-3 py-2 text-xs text-white shadow-lg">
          <p className="font-semibold">{active.label}</p>
          <p className="mt-1 text-lime-300">{active.clicks} clicks</p>
          <p>{active.leads} leads</p>
          <p className="text-white/50">{active.views} views</p>
          <p className="text-white/50">{active.clicks > 0 ? `${((active.leads / active.clicks) * 100).toFixed(1)}% conv.` : "—"}</p>
        </div>
      )}
    </div>
  );
}

function Drawer({ row, onClose }: { row: ListingRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`${row.title} performance detail`}>
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close detail panel" />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-[#111111] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-white">{row.title}</h2>
            <p className="mt-0.5 text-xs text-white/50">
              {row.trim ? `${row.trim} · ` : ""}Stock {row.stockNumber} · {formatPrice(row.price)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 hover:border-white/30 hover:text-white">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="grid gap-5 p-5">
          {row.photo && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-white/10">
              <Image src={row.photo} alt={row.title} fill sizes="420px" className="object-cover" />
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3">
            {[
              ["Listing views", num(row.views)],
              ["Vehicle clicks", num(row.clicks)],
              ["Unique visitors", num(row.uniqueVisitors)],
              ["Leads", num(row.leads)],
              ["Conversion rate", pct(row.conversionRate)],
              ["Test drives", num(row.testDrives)],
              ["Deals (qualified)", num(row.deals)],
              ["Days listed", num(row.daysListed)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] p-3">
                <dt className="text-[0.6875rem] uppercase tracking-wide text-white/45">{label}</dt>
                <dd className="mt-1 font-display text-lg font-bold tabular text-white">{value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Lead sources</h3>
            <div className="mt-2">
              <LeadSources row={row} />
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">Quick actions</h3>
            <Link href={`/inventory/${row.slug}`} target="_blank" className="inline-flex min-h-10 items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-white/15 px-3 text-sm font-medium text-white hover:border-lime-400/40 hover:text-lime-300">
              View live listing <ExternalLink className="size-4" aria-hidden />
            </Link>
            <Link href={`/crm/leads?q=${encodeURIComponent(row.stockNumber)}`} className="inline-flex min-h-10 items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-white/15 px-3 text-sm font-medium text-white hover:border-lime-400/40 hover:text-lime-300">
              See this vehicle&apos;s leads <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>

          <p className="text-xs text-white/35">
            Price history, assigned agents, and follow-up tasks aren&apos;t stored yet — inventory comes straight from DealerCenter on each sync, which doesn&apos;t send past prices.
          </p>
        </div>
      </div>
    </div>
  );
}
