/** Inventory quality warnings — used by `npm run inventory:check`, the import script, and the sync webhook response. */
import type { Vehicle } from "@/lib/types";

export const MIN_PHOTOS = 8;

export interface HealthWarning {
  stockNumber: string;
  vehicle: string;
  level: "error" | "warning";
  message: string;
}

export function inventoryHealth(vehicles: Vehicle[]): HealthWarning[] {
  const out: HealthWarning[] = [];
  const push = (v: Vehicle, level: HealthWarning["level"], message: string) =>
    out.push({ stockNumber: v.stockNumber, vehicle: `${v.year} ${v.make} ${v.model}`, level, message });

  const stocks = new Map<string, number>();
  for (const v of vehicles) stocks.set(v.stockNumber, (stocks.get(v.stockNumber) ?? 0) + 1);

  for (const v of vehicles) {
    if (v.status === "sold") continue;
    if (v.price == null) push(v, "warning", "Missing price — the site will show “Call for Price”.");
    if (v.photos.length === 0) push(v, "error", "No photos.");
    else if (v.photos.length < MIN_PHOTOS) push(v, "warning", `Low photo count (${v.photos.length}). Aim for at least ${MIN_PHOTOS}.`);
    if (!v.description || v.description.length < 120) push(v, "warning", "Missing or very short description.");
    if (!v.trim) push(v, "warning", "Trim not set.");
    if (!v.features.length) push(v, "warning", "No features/equipment listed.");
    if (v.mpgCity == null || v.mpgHighway == null) push(v, "warning", "MPG not set.");
    if ((stocks.get(v.stockNumber) ?? 0) > 1) push(v, "error", "Duplicate stock number.");
    if (v.exterior360Frames && ![36, 48, 72].includes(v.exterior360Frames.length))
      push(v, "warning", `360 sequence has ${v.exterior360Frames.length} frames; 36, 48, or 72 are supported.`);
    if (v.exterior360IsDemo) push(v, "warning", "Uses the DEMONSTRATION 360 sequence. Replace with a real capture before launch.");
  }
  return out;
}
