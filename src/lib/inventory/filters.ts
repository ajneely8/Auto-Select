/**
 * Inventory filtering, sorting, and facet counting.
 * Isomorphic: used by server components (initial render), the client explorer (instant updates),
 * the inventory assistant, and saved-search matching. Filters round-trip through URL query params.
 */
import type { Vehicle, VehicleCondition, VehicleStatus } from "@/lib/types";
import { displayPrice } from "@/lib/format";

export type SortKey = "newest" | "price-asc" | "price-desc" | "year-desc" | "year-asc" | "miles-asc" | "miles-desc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "year-desc", label: "Year: newest first" },
  { value: "year-asc", label: "Year: oldest first" },
  { value: "miles-asc", label: "Mileage: lowest first" },
  { value: "miles-desc", label: "Mileage: highest first" },
];

export interface InventoryFilters {
  q: string;
  condition: VehicleCondition[];
  make: string[];
  model: string[];
  body: string[];
  fuel: string[];
  transmission: string[];
  drivetrain: string[];
  exterior: string[];
  interior: string[];
  feature: string[];
  availability: VehicleStatus[];
  yearMin: number | null;
  yearMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  milesMax: number | null;
  sort: SortKey;
}

export type ListFilterKey = "condition" | "make" | "model" | "body" | "fuel" | "transmission" | "drivetrain" | "exterior" | "interior" | "feature" | "availability";
export type RangeFilterKey = "yearMin" | "yearMax" | "priceMin" | "priceMax" | "milesMax";

export const LIST_KEYS: ListFilterKey[] = ["condition", "make", "model", "body", "fuel", "transmission", "drivetrain", "exterior", "interior", "feature", "availability"];

/** URL param names. Kept short and readable for shareable links. */
const PARAM: Record<ListFilterKey | RangeFilterKey | "q" | "sort", string> = {
  q: "q",
  condition: "condition",
  make: "make",
  model: "model",
  body: "body",
  fuel: "fuel",
  transmission: "transmission",
  drivetrain: "drivetrain",
  exterior: "exterior",
  interior: "interior",
  feature: "feature",
  availability: "availability",
  yearMin: "year_min",
  yearMax: "year_max",
  priceMin: "price_min",
  priceMax: "price_max",
  milesMax: "miles_max",
  sort: "sort",
};

export const FILTER_LABELS: Record<ListFilterKey | RangeFilterKey | "q", string> = {
  q: "Keyword",
  condition: "Condition",
  make: "Make",
  model: "Model",
  body: "Body style",
  fuel: "Fuel type",
  transmission: "Transmission",
  drivetrain: "Drivetrain",
  exterior: "Exterior color",
  interior: "Interior color",
  feature: "Features",
  availability: "Availability",
  yearMin: "Min year",
  yearMax: "Max year",
  priceMin: "Min price",
  priceMax: "Max price",
  milesMax: "Max mileage",
};

export const emptyFilters = (): InventoryFilters => ({
  q: "",
  condition: [],
  make: [],
  model: [],
  body: [],
  fuel: [],
  transmission: [],
  drivetrain: [],
  exterior: [],
  interior: [],
  feature: [],
  availability: [],
  yearMin: null,
  yearMax: null,
  priceMin: null,
  priceMax: null,
  milesMax: null,
  sort: "newest",
});

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function read(src: ParamSource, key: string): string | undefined {
  if (src instanceof URLSearchParams) return src.get(key) ?? undefined;
  const v = src[key];
  return Array.isArray(v) ? v.join(",") : v;
}

const toList = (s: string | undefined) =>
  s ? s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 30) : [];

const toNum = (s: string | undefined) => {
  if (!s) return null;
  const n = Number(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

export function parseFilters(src: ParamSource): InventoryFilters {
  const f = emptyFilters();
  f.q = (read(src, PARAM.q) ?? "").slice(0, 80);
  for (const k of LIST_KEYS) (f[k] as string[]) = toList(read(src, PARAM[k]));
  f.yearMin = toNum(read(src, PARAM.yearMin));
  f.yearMax = toNum(read(src, PARAM.yearMax));
  f.priceMin = toNum(read(src, PARAM.priceMin));
  f.priceMax = toNum(read(src, PARAM.priceMax));
  f.milesMax = toNum(read(src, PARAM.milesMax));
  const sort = read(src, PARAM.sort) as SortKey | undefined;
  f.sort = SORT_OPTIONS.some((o) => o.value === sort) ? sort! : "newest";
  return f;
}

export function serializeFilters(f: InventoryFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set(PARAM.q, f.q.trim());
  for (const k of LIST_KEYS) if (f[k].length) p.set(PARAM[k], f[k].join(","));
  const ranges: RangeFilterKey[] = ["yearMin", "yearMax", "priceMin", "priceMax", "milesMax"];
  for (const k of ranges) if (f[k] != null) p.set(PARAM[k], String(f[k]));
  if (f.sort !== "newest") p.set(PARAM.sort, f.sort);
  return p;
}

export function filtersToHref(f: InventoryFilters) {
  const qs = serializeFilters(f).toString();
  return qs ? `/inventory?${qs}` : "/inventory";
}

export function activeFilterCount(f: InventoryFilters) {
  let n = f.q.trim() ? 1 : 0;
  for (const k of LIST_KEYS) n += f[k].length;
  for (const k of ["yearMin", "yearMax", "priceMin", "priceMax", "milesMax"] as const) if (f[k] != null) n++;
  return n;
}

/* ───────────── Dimension accessors (one place to define how a vehicle maps to a facet) ───────────── */

export const transmissionType = (v: Vehicle) => (v.transmission && /manual/i.test(v.transmission) ? "Manual" : v.transmission ? "Automatic" : null);

const DIMENSION: Record<ListFilterKey, (v: Vehicle) => string | string[] | null> = {
  condition: (v) => v.condition,
  make: (v) => v.make,
  model: (v) => v.model,
  body: (v) => v.bodyStyle,
  fuel: (v) => v.fuelType,
  transmission: transmissionType,
  drivetrain: (v) => v.drivetrain,
  exterior: (v) => v.exteriorColor,
  interior: (v) => v.interiorColor,
  feature: (v) => v.features,
  availability: (v) => v.status,
};

const norm = (s: string) => s.toLowerCase();

function matchesList(v: Vehicle, key: ListFilterKey, wanted: string[]) {
  if (!wanted.length) return true;
  const val = DIMENSION[key](v);
  if (val == null) return false;
  const w = wanted.map(norm);
  // Features must ALL be present; every other dimension is OR within the group.
  if (Array.isArray(val)) return w.every((x) => val.map(norm).includes(x));
  return w.includes(norm(val));
}

export function keywordHaystack(v: Vehicle) {
  return [v.year, v.make, v.model, v.trim, v.bodyStyle, v.exteriorColor, v.interiorColor, v.fuelType, v.drivetrain, v.engine, v.stockNumber, v.vin, ...v.features]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesKeyword(v: Vehicle, q: string) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = keywordHaystack(v);
  return terms.every((t) => hay.includes(t));
}

function matches(v: Vehicle, f: InventoryFilters, skip?: ListFilterKey) {
  if (!matchesKeyword(v, f.q)) return false;
  for (const k of LIST_KEYS) if (k !== skip && !matchesList(v, k, f[k])) return false;
  const price = displayPrice(v);
  if (f.yearMin != null && v.year < f.yearMin) return false;
  if (f.yearMax != null && v.year > f.yearMax) return false;
  if (f.priceMin != null && (price == null || price < f.priceMin)) return false;
  if (f.priceMax != null && (price == null || price > f.priceMax)) return false;
  if (f.milesMax != null && v.mileage > f.milesMax) return false;
  return true;
}

export function sortVehicles<T extends Vehicle>(list: T[], sort: SortKey): T[] {
  const p = (v: Vehicle) => displayPrice(v) ?? Number.MAX_SAFE_INTEGER;
  const cmp: Record<SortKey, (a: Vehicle, b: Vehicle) => number> = {
    newest: (a, b) => b.dateAdded.localeCompare(a.dateAdded) || b.year - a.year,
    "price-asc": (a, b) => p(a) - p(b),
    "price-desc": (a, b) => (displayPrice(b) ?? -1) - (displayPrice(a) ?? -1),
    "year-desc": (a, b) => b.year - a.year || a.mileage - b.mileage,
    "year-asc": (a, b) => a.year - b.year,
    "miles-asc": (a, b) => a.mileage - b.mileage,
    "miles-desc": (a, b) => b.mileage - a.mileage,
  };
  return [...list].sort(cmp[sort]);
}

export function applyFilters<T extends Vehicle>(list: T[], f: InventoryFilters): T[] {
  return sortVehicles(list.filter((v) => matches(v, f)), f.sort);
}

export interface FacetOption {
  value: string;
  count: number;
}

export type Facets = Record<ListFilterKey, FacetOption[]> & {
  year: { min: number; max: number };
  price: { min: number; max: number };
  miles: { max: number };
};

/**
 * Facet counts reflect all OTHER active filters, so each option shows how many
 * results you'd get by adding it — counts update instantly as filters change.
 */
export function computeFacets(all: Vehicle[], f: InventoryFilters): Facets {
  const out = {} as Facets;
  for (const key of LIST_KEYS) {
    const pool = all.filter((v) => matches(v, f, key));
    const counts = new Map<string, number>();
    // Seed every value from the full inventory so options don't vanish (they show 0 instead).
    for (const v of all) {
      const val = DIMENSION[key](v);
      for (const x of Array.isArray(val) ? val : val ? [val] : []) if (!counts.has(x)) counts.set(x, 0);
    }
    for (const v of pool) {
      const val = DIMENSION[key](v);
      for (const x of Array.isArray(val) ? val : val ? [val] : []) counts.set(x, (counts.get(x) ?? 0) + 1);
    }
    out[key] = [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value, "en", { numeric: true }));
  }
  // Only show models belonging to selected makes (or all models when no make chosen).
  if (f.make.length) {
    const makes = f.make.map(norm);
    const allowed = new Set(all.filter((v) => makes.includes(norm(v.make))).map((v) => v.model));
    out.model = out.model.filter((m) => allowed.has(m.value));
  }
  const years = all.map((v) => v.year);
  const prices = all.map(displayPrice).filter((n): n is number => n != null);
  out.year = { min: Math.min(...years), max: Math.max(...years) };
  out.price = { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 };
  out.miles = { max: Math.max(...all.map((v) => v.mileage)) };
  return out;
}

/** Human-readable chips for the active filters. */
export function activeChips(f: InventoryFilters): { key: ListFilterKey | RangeFilterKey | "q"; value: string; label: string }[] {
  const chips: { key: ListFilterKey | RangeFilterKey | "q"; value: string; label: string }[] = [];
  if (f.q.trim()) chips.push({ key: "q", value: f.q, label: `“${f.q.trim()}”` });
  for (const k of LIST_KEYS) for (const v of f[k]) chips.push({ key: k, value: v, label: k === "condition" || k === "availability" ? v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ") : v });
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
  if (f.yearMin != null) chips.push({ key: "yearMin", value: String(f.yearMin), label: `From ${f.yearMin}` });
  if (f.yearMax != null) chips.push({ key: "yearMax", value: String(f.yearMax), label: `Up to ${f.yearMax}` });
  if (f.priceMin != null) chips.push({ key: "priceMin", value: String(f.priceMin), label: `Over ${usd(f.priceMin)}` });
  if (f.priceMax != null) chips.push({ key: "priceMax", value: String(f.priceMax), label: `Under ${usd(f.priceMax)}` });
  if (f.milesMax != null) chips.push({ key: "milesMax", value: String(f.milesMax), label: `Under ${f.milesMax.toLocaleString("en-US")} mi` });
  return chips;
}

export function removeChip(f: InventoryFilters, key: ListFilterKey | RangeFilterKey | "q", value: string): InventoryFilters {
  const next = { ...f };
  if (key === "q") next.q = "";
  else if ((LIST_KEYS as string[]).includes(key)) (next[key as ListFilterKey] as string[]) = f[key as ListFilterKey].filter((x) => x !== value);
  else (next[key as RangeFilterKey] as number | null) = null;
  return next;
}
