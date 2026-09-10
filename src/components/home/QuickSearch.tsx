"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

export interface QuickSearchOptions {
  conditions: string[];
  makes: string[];
  modelsByMake: Record<string, string[]>;
  bodies: string[];
  priceSteps: number[];
}

const selectCls =
  "h-12 w-full appearance-none rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 pr-9 text-[0.9375rem] text-ink focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%234a5260' stroke-width='1.6'/%3E%3C/svg%3E\")] bg-[position:right_0.85rem_center] bg-no-repeat disabled:bg-surface disabled:text-muted";

/** Plain GET form to /inventory — works without JavaScript; JS only narrows the model list by make. */
export function QuickSearch({ options, total }: { options: QuickSearchOptions; total: number }) {
  const [make, setMake] = useState("");
  const models = make ? (options.modelsByMake[make] ?? []) : Object.values(options.modelsByMake).flat().sort();
  const showCondition = options.conditions.length > 1;

  return (
    <form
      action="/inventory"
      method="get"
      role="search"
      aria-labelledby="quick-search-heading"
      onSubmit={(e) => {
        // Disabled controls aren't submitted, so "Any …" choices don't clutter the URL.
        const empty = Array.from(e.currentTarget.elements).filter((el): el is HTMLSelectElement => el instanceof HTMLSelectElement && !el.value);
        empty.forEach((el) => (el.disabled = true));
        // Re-enable after the browser has captured the form data (and for Back-button restores).
        setTimeout(() => empty.forEach((el) => (el.disabled = false)), 0);
        track("inventory_search", { source: "home_quick_search" });
      }} className="rounded-[var(--radius-md)] border border-line bg-white p-4 shadow-[var(--shadow-raised)] sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="quick-search-heading" className="font-display text-xl font-bold">
          Search our inventory
        </h2>
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink tabular">{total}</span> vehicles available
        </p>
      </div>
      <div className={`grid gap-3 sm:grid-cols-2 ${showCondition ? "lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]" : "lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]"}`}>
        {showCondition && (
          <label className="text-xs font-semibold text-slate">
            New / used
            <select name="condition" className={`${selectCls} mt-1`} defaultValue="">
              <option value="">New &amp; used</option>
              {options.conditions.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="text-xs font-semibold text-slate">
          Make
          <select name="make" className={`${selectCls} mt-1`} value={make} onChange={(e) => setMake(e.target.value)}>
            <option value="">Any make</option>
            {options.makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate">
          Model
          <select name="model" key={make} className={`${selectCls} mt-1`} defaultValue="">
            <option value="">Any model</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate">
          Body style
          <select name="body" className={`${selectCls} mt-1`} defaultValue="">
            <option value="">Any body style</option>
            {options.bodies.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate">
          Max price
          <select name="price_max" className={`${selectCls} mt-1`} defaultValue="">
            <option value="">Any price</option>
            {options.priceSteps.map((p) => (
              <option key={p} value={p}>
                Under ${p.toLocaleString("en-US")}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className={buttonClasses("primary", "lg", "h-12 w-full lg:w-auto")}>
            <Search className="size-4" aria-hidden /> Search
          </button>
        </div>
      </div>
      <Link href="/inventory" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-navy-700 underline-offset-2 hover:underline">
        <SlidersHorizontal className="size-4" aria-hidden /> Advanced filters: year, mileage, drivetrain, color, and more
      </Link>
    </form>
  );
}
