import "server-only";
import { cache } from "react";
import localInventory from "@data/inventory.json";
import type { InventoryFile, Vehicle } from "@/lib/types";
import { normalizeVehicle } from "./schema";
import { env } from "@/config/env";

/**
 * Inventory repository. Pages, the sitemap, JSON-LD, and the inventory assistant all read through here.
 *
 * Sources (set INVENTORY_SOURCE):
 *  - "local" (default): data/inventory.json — replace via `npm run inventory:import`.
 *  - "feed": fetch INVENTORY_FEED_URL (JSON array or { vehicles: [] }) and revalidate every
 *    INVENTORY_REVALIDATE_SECONDS. Falls back to the local file if the feed fails.
 */
async function loadRaw(): Promise<unknown[]> {
  if (env.INVENTORY_SOURCE === "feed" && env.INVENTORY_FEED_URL) {
    try {
      const res = await fetch(env.INVENTORY_FEED_URL, {
        headers: env.INVENTORY_FEED_TOKEN ? { Authorization: `Bearer ${env.INVENTORY_FEED_TOKEN}` } : undefined,
        next: { revalidate: env.INVENTORY_REVALIDATE_SECONDS, tags: ["inventory"] },
      });
      if (!res.ok) throw new Error(`Feed responded ${res.status}`);
      const body = (await res.json()) as unknown;
      const list = Array.isArray(body) ? body : (body as { vehicles?: unknown[] }).vehicles;
      if (!Array.isArray(list)) throw new Error("Feed JSON must be an array or { vehicles: [] }");
      return list;
    } catch (err) {
      console.error("[inventory] feed failed, using local file:", err);
    }
  }
  return (localInventory as unknown as InventoryFile).vehicles;
}

export const getAllVehicles = cache(async (): Promise<Vehicle[]> => {
  const raw = await loadRaw();
  const out: Vehicle[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    const { vehicle, errors } = normalizeVehicle(r);
    if (!vehicle) {
      console.warn("[inventory] skipped invalid vehicle:", errors.join("; "));
      continue;
    }
    if (seen.has(vehicle.slug)) continue; // duplicate stock numbers in a feed
    seen.add(vehicle.slug);
    out.push(vehicle);
  }
  return out;
});

/** Sold vehicles are automatically unpublished from listings, search, featured, sitemap, and the assistant. */
export const isPublished = (v: Vehicle) => v.status !== "sold";

export async function getPublishedVehicles() {
  return (await getAllVehicles()).filter(isPublished);
}

export async function getVehicleBySlug(slug: string) {
  return (await getAllVehicles()).find((v) => v.slug === slug) ?? null;
}

export async function getVehicleById(id: string) {
  const all = await getAllVehicles();
  const key = id.toLowerCase();
  return all.find((v) => v.id === key || v.stockNumber.toLowerCase() === key || v.slug === key) ?? null;
}

/**
 * Featured rules: vehicles flagged `featured` first; then fill with the newest
 * published vehicles that have a price and at least 8 photos.
 */
export async function getFeaturedVehicles(n = 6) {
  const pub = await getPublishedVehicles();
  const flagged = pub.filter((v) => v.featured && v.photos.length > 0);
  const fill = pub
    .filter((v) => !v.featured && v.price != null && v.photos.length >= 8)
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
  return [...flagged, ...fill].slice(0, n);
}

/** Similar = same body style, then closest price, excluding the current vehicle. */
export async function getSimilarVehicles(v: Vehicle, n = 3) {
  const pub = (await getPublishedVehicles()).filter((x) => x.id !== v.id);
  const price = v.price ?? 0;
  return pub
    .map((x) => ({ x, score: (x.bodyStyle === v.bodyStyle ? 0 : 50_000) + Math.abs((x.price ?? 0) - price) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, n)
    .map((s) => s.x);
}

export function getInventoryMeta() {
  return (localInventory as unknown as InventoryFile).meta;
}
