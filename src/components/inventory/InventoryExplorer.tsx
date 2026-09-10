"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, LayoutGrid, List, X, BookmarkPlus, Check, SearchX } from "lucide-react";
import type { VehicleSummary } from "@/lib/inventory/summary";
import {
  applyFilters,
  computeFacets,
  parseFilters,
  serializeFilters,
  activeChips,
  removeChip,
  activeFilterCount,
  emptyFilters,
  SORT_OPTIONS,
  type InventoryFilters,
  type ListFilterKey,
  type SortKey,
} from "@/lib/inventory/filters";
import { FilterPanel } from "./FilterPanel";
import { VehicleCard } from "./VehicleCard";
import { AlertSignup } from "./AlertSignup";
import { useSavedSearches } from "@/lib/shopping/store";
import { track } from "@/lib/analytics";
import { buttonClasses } from "@/components/ui/Button";
import { business } from "@/config/business";

const VIEW_KEY = "as_inventory_view";

export function InventoryExplorer({ vehicles }: { vehicles: VehicleSummary[] }) {
  const params = useSearchParams();
  // URL is the single source of truth: shareable links + back/forward just work.
  const filters = useMemo(() => parseFilters(new URLSearchParams(params.toString())), [params]);
  const [keyword, setKeyword] = useState(filters.q);
  const [view, setView] = useState<"grid" | "list">("grid");
  const drawerRef = useRef<HTMLDialogElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "list" || saved === "grid") setView(saved);
    } catch {}
  }, []);

  // Keep the keyword box in sync when the URL changes via back/forward.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKeyword(filters.q);
  }, [filters.q]);

  const results = useMemo(() => applyFilters(vehicles, filters), [vehicles, filters]);
  const facets = useMemo(() => computeFacets(vehicles, filters), [vehicles, filters]);
  const chips = activeChips(filters);
  const nActive = activeFilterCount(filters);

  function commit(next: InventoryFilters, mode: "push" | "replace" = "push", changed?: string) {
    const qs = serializeFilters(next).toString();
    const url = qs ? `/inventory?${qs}` : "/inventory";
    window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
    if (changed) track("filter_applied", { filter: changed, result_count: applyFilters(vehicles, next).length });
  }

  // Debounced keyword → URL (replace, so typing doesn't flood history).
  useEffect(() => {
    if (keyword === filters.q) return;
    const t = setTimeout(() => {
      commit({ ...filters, q: keyword }, "replace");
      if (keyword.trim().length > 1) track("inventory_search", { result_count: applyFilters(vehicles, { ...filters, q: keyword }).length });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  function toggle(key: ListFilterKey, value: string) {
    const cur = filters[key] as string[];
    const has = cur.some((x) => x.toLowerCase() === value.toLowerCase());
    const nextList = has ? cur.filter((x) => x.toLowerCase() !== value.toLowerCase()) : [...cur, value];
    const next = { ...filters, [key]: nextList } as InventoryFilters;
    // Deselecting a make drops models that no longer belong to a selected make.
    if (key === "make" && has) {
      const makes = new Set(nextList.map((m) => m.toLowerCase()));
      next.model = makes.size ? filters.model.filter((m) => vehicles.some((v) => v.model === m && makes.has(v.make.toLowerCase()))) : filters.model;
    }
    commit(next, "push", key);
  }

  function setRange(key: "yearMin" | "yearMax" | "priceMin" | "priceMax" | "milesMax", value: number | null) {
    commit({ ...filters, [key]: value }, "push", key);
  }

  function setSort(sort: SortKey) {
    commit({ ...filters, sort }, "replace");
  }

  function clearAll() {
    setKeyword("");
    commit({ ...emptyFilters(), sort: filters.sort }, "push", "clear_all");
  }

  function changeView(v: "grid" | "list") {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  }

  // Announce result counts to screen readers after changes.
  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = `${results.length} ${results.length === 1 ? "vehicle" : "vehicles"} found`;
  }, [results.length]);

  const panel = <FilterPanel filters={filters} facets={facets} keyword={keyword} onKeyword={setKeyword} onToggle={toggle} onRange={setRange} />;
  const queryString = serializeFilters(filters).toString();

  return (
    <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      {/* Desktop sticky sidebar */}
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-[88px] max-h-[calc(100dvh-104px)] overflow-y-auto rounded-[var(--radius-md)] border border-line bg-white p-4 [scrollbar-width:thin]">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Filters</h2>
            {nActive > 0 && (
              <button type="button" onClick={clearAll} className="min-h-10 text-sm font-semibold text-navy-700 underline-offset-2 hover:underline">
                Clear all
              </button>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile sticky sort + filter bar */}
        <div className="sticky top-14 z-20 -mx-4 mb-4 flex items-center gap-2 border-b border-line bg-white/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <button type="button" onClick={() => drawerRef.current?.showModal()} className={buttonClasses("outline", "md", "flex-1")} aria-haspopup="dialog">
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters{nActive > 0 && <span className="rounded-full bg-navy-900 px-1.5 text-xs text-white tabular">{nActive}</span>}
          </button>
          <label className="sr-only" htmlFor="sort-mobile">
            Sort by
          </label>
          <select id="sort-mobile" value={filters.sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-11 flex-1 rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 text-sm font-medium">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate">
            <span className="font-display text-2xl font-bold text-ink tabular">{results.length}</span> {results.length === 1 ? "vehicle" : "vehicles"}
            {nActive > 0 && <span> match your filters</span>}
          </p>
          <p ref={liveRef} aria-live="polite" className="sr-only" />
          <div className="flex items-center gap-2">
            <SaveSearch query={queryString} disabled={nActive === 0} />
            <label className="sr-only" htmlFor="sort-desktop">
              Sort by
            </label>
            <select id="sort-desktop" value={filters.sort} onChange={(e) => setSort(e.target.value as SortKey)} className="hidden h-11 rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 text-sm font-medium lg:block">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </select>
            <div role="group" aria-label="Layout" className="hidden sm:inline-flex rounded-[var(--radius-sm)] border border-line-strong p-0.5">
              {(["grid", "list"] as const).map((v) => {
                const Icon = v === "grid" ? LayoutGrid : List;
                return (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => changeView(v)} className="inline-flex size-10 items-center justify-center rounded-[3px] text-slate aria-pressed:bg-navy-900 aria-pressed:text-white" aria-label={`${v === "grid" ? "Grid" : "List"} view`}>
                    <Icon className="size-4" aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={`${c.key}:${c.value}`} className="animate-chip-in">
                <button
                  type="button"
                  onClick={() => {
                    if (c.key === "q") setKeyword("");
                    commit(removeChip(filters, c.key, c.value), "push", `remove_${c.key}`);
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-navy-900 bg-navy-900 py-1 pl-3 pr-2 text-sm font-medium text-white hover:bg-navy-800"
                  aria-label={`Remove filter: ${c.label}`}
                >
                  {c.label}
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearAll} className="min-h-9 px-2 text-sm font-semibold text-navy-700 underline underline-offset-2">
                Clear all
              </button>
            </li>
          </ul>
        )}

        {results.length > 0 ? (
          <ul className={`mt-5 grid gap-5 ${view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
            {results.map((v, i) => (
              <li key={v.id} className="flex">
                <div className="flex w-full [&>article]:w-full">
                  <VehicleCard v={v} layout={view} priority={i < 3} headingLevel="h2" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState onClear={clearAll} hasFilters={nActive > 0} query={queryString} lastChip={chips[chips.length - 1]} onRemoveLast={() => chips.length && commit(removeChip(filters, chips[chips.length - 1].key, chips[chips.length - 1].value))} />
        )}

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Prices exclude tax, title, license, and dealer fees. “Est./mo” figures are illustrations only — they assume 10% down and 72 months at an example{" "}
          {business.financing.calculatorExampleApr}% APR, and are not an offer of credit. Your rate and terms depend on lender approval. Please confirm availability with
          our team.
        </p>
      </div>

      {/* Mobile filter drawer */}
      <dialog ref={drawerRef} aria-label="Filters" className="m-0 mt-auto h-[88dvh] max-h-[88dvh] w-full max-w-none rounded-t-[var(--radius-lg)] bg-white p-0 backdrop:bg-navy-950/50 open:animate-fade-up lg:hidden" onClick={(e) => e.target === e.currentTarget && drawerRef.current?.close()}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <h2 className="font-display text-lg font-bold">Filters</h2>
            <button type="button" onClick={() => drawerRef.current?.close()} className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] hover:bg-surface" aria-label="Close filters">
              <X className="size-6" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">{panel}</div>
          <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={clearAll} className={buttonClasses("ghost", "lg")} disabled={nActive === 0}>
              Clear
            </button>
            <button type="button" onClick={() => drawerRef.current?.close()} className={buttonClasses("secondary", "lg")}>
              Show {results.length} {results.length === 1 ? "vehicle" : "vehicles"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function SaveSearch({ query, disabled }: { query: string; disabled: boolean }) {
  const { searches, save } = useSavedSearches();
  const saved = searches.some((s) => s.query === query);
  return (
    <button
      type="button"
      disabled={disabled || saved}
      onClick={() => {
        const label = new URLSearchParams(query);
        const name = [label.get("make"), label.get("body"), label.get("price_max") ? `under $${Number(label.get("price_max")).toLocaleString("en-US")}` : null].filter(Boolean).join(" · ") || "My search";
        save(name, query);
      }}
      className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 text-sm font-semibold text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-60"
      title={disabled ? "Apply a filter to save this search" : undefined}
    >
      {saved ? <Check className="size-4 text-success" aria-hidden /> : <BookmarkPlus className="size-4" aria-hidden />}
      <span className="hidden sm:inline">{saved ? "Search saved" : "Save search"}</span>
      <span className="sm:hidden sr-only">{saved ? "Search saved" : "Save search"}</span>
    </button>
  );
}

function EmptyState({
  onClear,
  hasFilters,
  query,
  lastChip,
  onRemoveLast,
}: {
  onClear: () => void;
  hasFilters: boolean;
  query: string;
  lastChip?: { label: string };
  onRemoveLast: () => void;
}) {
  return (
    <div className="mt-6 rounded-[var(--radius-md)] border border-line bg-surface p-6 sm:p-10">
      <div className="mx-auto max-w-xl text-center">
        <SearchX className="mx-auto size-8 text-navy-700" aria-hidden />
        <h2 className="mt-3 font-display text-2xl font-bold">No vehicles match those filters</h2>
        <p className="mt-2 text-slate">Try removing a filter, or tell us what you&apos;re looking for — locating vehicles that aren&apos;t on our lot is part of what we do.</p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          {lastChip && (
            <button type="button" onClick={onRemoveLast} className={buttonClasses("outline", "md")}>
              Remove “{lastChip.label}”
            </button>
          )}
          {hasFilters && (
            <button type="button" onClick={onClear} className={buttonClasses("outline", "md")}>
              Clear all filters
            </button>
          )}
          <Link href="/find-a-vehicle" className={buttonClasses("primary", "md")}>
            Ask us to find it
          </Link>
        </div>
      </div>
      {hasFilters && (
        <div className="mx-auto mt-8 max-w-xl border-t border-line pt-6">
          <AlertSignup query={query} />
        </div>
      )}
    </div>
  );
}
