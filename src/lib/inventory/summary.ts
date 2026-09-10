import type { Vehicle } from "@/lib/types";

/**
 * Lightweight vehicle shape sent to client components (cards, compare, saved, assistant).
 * Structurally a Vehicle, so filters/sorting work on it, but with heavy/private fields trimmed.
 */
export type VehicleSummary = Vehicle & { photoCount: number; has360: boolean };

export function toSummary(v: Vehicle): VehicleSummary {
  return {
    ...v,
    description: null,
    internalNotes: undefined,
    photos: v.photos.slice(0, 2),
    exterior360Frames: null,
    photoCount: v.photos.length,
    has360: !!(v.exterior360Frames?.length || v.exterior360EmbedUrl),
  };
}
