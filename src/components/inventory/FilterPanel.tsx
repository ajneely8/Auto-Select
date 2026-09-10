"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { Facets, InventoryFilters, ListFilterKey } from "@/lib/inventory/filters";
import { FILTER_LABELS } from "@/lib/inventory/filters";

const selectCls =
  "h-11 w-full appearance-none rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 pr-8 text-sm text-ink focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%234a5260' stroke-width='1.6'/%3E%3C/svg%3E\")] bg-[position:right_0.7rem_center] bg-no-repeat";

function Group({ title, children, defaultOpen = true, count = 0 }: { title: string; children: ReactNode; defaultOpen?: boolean; count?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-line py-1 last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-sm font-semibold text-ink"
        >
          <span>
            {title}
            {count > 0 && <span className="ml-2 rounded-full bg-navy-900 px-1.5 py-0.5 text-[0.6875rem] font-bold text-white tabular">{count}</span>}
          </span>
          <ChevronDown className={`size-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </h3>
      <div id={id} hidden={!open} className="pb-3">
        {children}
      </div>
    </div>
  );
}

function CheckList({ name, options, selected, onToggle, format }: { name: ListFilterKey; options: { value: string; count: number }[]; selected: string[]; onToggle: (v: string) => void; format?: (v: string) => string }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, 8);
  return (
    <fieldset>
      <legend className="sr-only">{FILTER_LABELS[name]}</legend>
      <ul className="grid gap-0.5">
        {visible.map((o) => {
          const checked = selected.some((s) => s.toLowerCase() === o.value.toLowerCase());
          const disabled = !checked && o.count === 0;
          return (
            <li key={o.value}>
              <label className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-[var(--radius-xs)] px-1 text-sm hover:bg-surface ${disabled ? "cursor-not-allowed text-muted/70" : "text-slate"}`}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggle(o.value)} className="size-[18px] shrink-0 rounded-[3px] accent-navy-900" />
                <span className={`flex-1 ${checked ? "font-semibold text-ink" : ""}`}>{format ? format(o.value) : o.value}</span>
                <span className="text-xs tabular text-muted" aria-label={`${o.count} vehicles`}>
                  {o.count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {options.length > 8 && (
        <button type="button" onClick={() => setShowAll((s) => !s)} className="mt-1 min-h-10 text-sm font-semibold text-navy-700 underline-offset-2 hover:underline">
          {showAll ? "Show fewer" : `Show all ${options.length}`}
        </button>
      )}
    </fieldset>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ");

function range(from: number, to: number, step: number) {
  const out: number[] = [];
  for (let n = from; n <= to; n += step) out.push(n);
  return out;
}

export function FilterPanel({
  filters,
  facets,
  keyword,
  onKeyword,
  onToggle,
  onRange,
}: {
  filters: InventoryFilters;
  facets: Facets;
  keyword: string;
  onKeyword: (q: string) => void;
  onToggle: (key: ListFilterKey, value: string) => void;
  onRange: (key: "yearMin" | "yearMax" | "priceMin" | "priceMax" | "milesMax", value: number | null) => void;
}) {
  const kwId = useId();
  const years = range(facets.year.min, facets.year.max, 1).reverse();
  const priceSteps = [5000, 7500, 10000, 12500, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 75000, 100000].filter((p) => p <= Math.max(facets.price.max + 10000, 20000));
  const mileSteps = [10000, 25000, 50000, 75000, 100000, 125000, 150000, 200000];

  const list = (key: ListFilterKey, title: string, defaultOpen = true, format?: (v: string) => string) =>
    facets[key].length > 0 ? (
      <Group title={title} defaultOpen={defaultOpen} count={filters[key].length}>
        <CheckList name={key} options={facets[key]} selected={filters[key]} onToggle={(v) => onToggle(key, v)} format={format} />
      </Group>
    ) : null;

  return (
    <div>
      <div className="pb-3">
        <label htmlFor={kwId} className="mb-1.5 block text-sm font-semibold text-ink">
          Keyword search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id={kwId}
            type="search"
            value={keyword}
            onChange={(e) => onKeyword(e.target.value)}
            placeholder="Make, model, color, stock #"
            className="h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-white pl-9 pr-3 text-sm focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25"
            enterKeyHint="search"
          />
        </div>
      </div>

      {list("make", "Make")}
      {list("model", "Model", filters.make.length > 0)}

      <Group title="Price" count={(filters.priceMin != null ? 1 : 0) + (filters.priceMax != null ? 1 : 0)}>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-medium text-slate">
            Min
            <select className={`${selectCls} mt-1`} value={filters.priceMin ?? ""} onChange={(e) => onRange("priceMin", e.target.value ? Number(e.target.value) : null)}>
              <option value="">No min</option>
              {priceSteps.map((p) => (
                <option key={p} value={p}>
                  ${p.toLocaleString("en-US")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate">
            Max
            <select className={`${selectCls} mt-1`} value={filters.priceMax ?? ""} onChange={(e) => onRange("priceMax", e.target.value ? Number(e.target.value) : null)}>
              <option value="">No max</option>
              {priceSteps.map((p) => (
                <option key={p} value={p}>
                  ${p.toLocaleString("en-US")}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Group>

      <Group title="Year" count={(filters.yearMin != null ? 1 : 0) + (filters.yearMax != null ? 1 : 0)}>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-medium text-slate">
            From
            <select className={`${selectCls} mt-1`} value={filters.yearMin ?? ""} onChange={(e) => onRange("yearMin", e.target.value ? Number(e.target.value) : null)}>
              <option value="">Any</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate">
            To
            <select className={`${selectCls} mt-1`} value={filters.yearMax ?? ""} onChange={(e) => onRange("yearMax", e.target.value ? Number(e.target.value) : null)}>
              <option value="">Any</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Group>

      <Group title="Mileage" count={filters.milesMax != null ? 1 : 0}>
        <label className="text-xs font-medium text-slate">
          Maximum mileage
          <select className={`${selectCls} mt-1`} value={filters.milesMax ?? ""} onChange={(e) => onRange("milesMax", e.target.value ? Number(e.target.value) : null)}>
            <option value="">Any mileage</option>
            {mileSteps.map((m) => (
              <option key={m} value={m}>
                Under {m.toLocaleString("en-US")} mi
              </option>
            ))}
          </select>
        </label>
      </Group>

      {list("body", "Body style")}
      {list("fuel", "Fuel type", false)}
      {list("transmission", "Transmission", false)}
      {list("drivetrain", "Drivetrain", false)}
      {list("exterior", "Exterior color", false)}
      {list("interior", "Interior color", false)}
      {list("feature", "Features", false)}
      {list("condition", "Condition", false, cap)}
      {list("availability", "Availability", false, cap)}
    </div>
  );
}
