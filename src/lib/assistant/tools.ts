import "server-only";
import type { Vehicle } from "@/lib/types";
import { getPublishedVehicles } from "@/lib/inventory/repository";
import { applyFilters, emptyFilters, keywordHaystack, type SortKey } from "@/lib/inventory/filters";
import { displayPrice, vehicleFullName } from "@/lib/format";
import { estimate } from "@/lib/finance";
import { business } from "@/config/business";
import { showDemo360 } from "@/config/site";

/**
 * Inventory tools shared by the Claude-backed assistant and the offline fallback engine.
 * Every fact the assistant states about a vehicle must come from these functions.
 * Internal staff notes are never exposed.
 */

export interface SearchArgs {
  query?: string;
  make?: string;
  model?: string;
  body_style?: string;
  min_price?: number;
  max_price?: number;
  max_mileage?: number;
  min_year?: number;
  max_year?: number;
  drivetrain?: string;
  fuel_type?: string;
  min_seats?: number;
  feature?: string;
  sort?: "price_low" | "price_high" | "newest_year" | "lowest_mileage" | "newest_arrivals";
  limit?: number;
}

const SORT_MAP: Record<NonNullable<SearchArgs["sort"]>, SortKey> = {
  price_low: "price-asc",
  price_high: "price-desc",
  newest_year: "year-desc",
  lowest_mileage: "miles-asc",
  newest_arrivals: "newest",
};

export function compact(v: Vehicle) {
  return {
    stock_number: v.stockNumber,
    title: vehicleFullName(v),
    price_usd: displayPrice(v),
    mileage: v.mileage,
    body_style: v.bodyStyle,
    drivetrain: v.drivetrain,
    fuel_type: v.fuelType,
    exterior_color: v.exteriorColor,
    interior_color: v.interiorColor,
    status: v.status,
    url: `/inventory/${v.slug}`,
  };
}

export function detailed(v: Vehicle) {
  return {
    ...compact(v),
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim ?? "not listed",
    condition: v.condition,
    engine: v.engine,
    transmission: v.transmission,
    doors: v.doors,
    seats: v.seats,
    mpg_city: v.mpgCity ?? "not listed",
    mpg_highway: v.mpgHighway ?? "not listed",
    features: v.features.length ? v.features : "No equipment list is posted for this vehicle yet.",
    description: v.description,
    photo_count: v.photos.length,
    has_360_view: !!((v.exterior360Frames && (!v.exterior360IsDemo || showDemo360)) || v.exterior360EmbedUrl),
    vehicle_history_report: v.historyReportUrl ? "available on the vehicle page" : "not posted",
    vin_last_6: v.vin.slice(-6),
    date_listed: v.dateAdded,
  };
}

/** Loose, case-insensitive matching so "Chevy", "4x4", "truck" etc. map onto the data. */
const ALIASES: Record<string, string> = { chevy: "chevrolet", vw: "volkswagen", merc: "mercedes-benz", "4x4": "4wd", truck: "pickup", van: "minivan" };
const norm = (s: string) => {
  const t = s.toLowerCase().trim();
  return ALIASES[t] ?? t;
};

export async function searchInventory(args: SearchArgs) {
  const all = await getPublishedVehicles();
  let list = all.filter((v) => {
    if (args.make && !v.make.toLowerCase().includes(norm(args.make))) return false;
    if (args.model && !v.model.toLowerCase().includes(norm(args.model))) return false;
    if (args.body_style && !(v.bodyStyle ?? "").toLowerCase().includes(norm(args.body_style))) return false;
    if (args.drivetrain) {
      const d = norm(args.drivetrain);
      const vd = (v.drivetrain ?? "").toLowerCase();
      const allWheels = ["awd", "4wd", "all-wheel", "four-wheel"];
      if (allWheels.some((x) => d.includes(x)) ? !["awd", "4wd"].includes(vd) : !vd.includes(d)) return false;
    }
    if (args.fuel_type && !(v.fuelType ?? "").toLowerCase().includes(norm(args.fuel_type))) return false;
    if (args.min_seats && (v.seats ?? 0) < args.min_seats && !(args.min_seats >= 6 && v.features.some((f) => /third-row/i.test(f)))) return false;
    if (args.feature && !v.features.some((f) => f.toLowerCase().includes(args.feature!.toLowerCase()))) return false;
    if (args.query) {
      const hay = keywordHaystack(v);
      if (!args.query.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.includes(norm(t)))) return false;
    }
    return true;
  });
  const f = { ...emptyFilters(), priceMin: args.min_price ?? null, priceMax: args.max_price ?? null, milesMax: args.max_mileage ?? null, yearMin: args.min_year ?? null, yearMax: args.max_year ?? null, sort: SORT_MAP[args.sort ?? "newest_arrivals"] };
  list = applyFilters(list, f);
  const limit = Math.min(Math.max(args.limit ?? 6, 1), 12);
  return {
    total_matches: list.length,
    total_in_inventory: all.length,
    vehicles: list.slice(0, limit).map(compact),
    note: "Listings reflect the website inventory. Availability must be confirmed by the Auto Select team.",
  };
}

export async function findVehicle(ref: string) {
  const all = await getPublishedVehicles();
  const key = ref.trim().toLowerCase();
  return (
    all.find((v) => v.stockNumber.toLowerCase() === key || v.id === key || v.slug === key || `/inventory/${v.slug}` === key || (key.length >= 6 && v.vin.toLowerCase().endsWith(key))) ?? null
  );
}

export async function getVehicleDetails(ref: string) {
  const v = await findVehicle(ref);
  return v ? detailed(v) : { error: `No published vehicle matches "${ref}". It may have sold or the stock number may be wrong. Use search_inventory to look it up.` };
}

export function estimatePayment(args: { price: number; down_payment?: number; trade_value?: number; apr?: number; term_months?: number }) {
  const apr = args.apr ?? business.financing.calculatorExampleApr;
  const months = args.term_months ?? 72;
  const r = estimate({ price: args.price, down: args.down_payment ?? 0, trade: args.trade_value ?? 0, apr, months });
  return {
    estimated_monthly_payment_usd: Math.round(r.payment),
    amount_financed_usd: Math.round(r.financed),
    assumptions: { apr_percent: apr, term_months: months, down_payment_usd: args.down_payment ?? 0, trade_value_usd: args.trade_value ?? 0 },
    disclaimer: `Illustration only, not an offer of credit. ${args.apr == null ? `${apr}% is an example rate, not a quoted rate. ` : ""}Excludes tax, title, license, and dealer fees. Actual rate and terms depend on lender approval.`,
  };
}
