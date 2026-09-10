/**
 * Runtime validation + normalization for inventory coming from ANY source (local file, JSON feed, CSV import).
 * Adapters map their raw shape into `RawVehicleInput`, then `normalizeVehicle` produces a trusted `Vehicle`.
 */
import { z } from "zod";
import type { Vehicle } from "@/lib/types";

const nullableNum = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? null : typeof v === "string" ? Number(v.replace(/[^\d.]/g, "")) : v),
  z.number().nonnegative().nullable(),
);

export const vehicleSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().optional(),
  status: z.enum(["available", "pending", "sold", "in-transit"]).default("available"),
  condition: z.enum(["new", "used", "certified"]).default("used"),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 2),
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  trim: z.string().trim().nullish().transform((v) => v || null),
  bodyStyle: z.string().trim().nullish().transform((v) => v || null),
  price: nullableNum,
  salePrice: nullableNum.default(null),
  mileage: z.coerce.number().int().nonnegative(),
  vin: z.string().trim().toUpperCase().regex(/^[A-HJ-NPR-Z0-9]{11,17}$/, "Invalid VIN"),
  stockNumber: z.string().trim().min(1),
  exteriorColor: z.string().trim().nullish().transform((v) => v || null),
  interiorColor: z.string().trim().nullish().transform((v) => v || null),
  transmission: z.string().trim().nullish().transform((v) => v || null),
  drivetrain: z.string().trim().nullish().transform((v) => v || null),
  fuelType: z.string().trim().nullish().transform((v) => v || null),
  engine: z.string().trim().nullish().transform((v) => v || null),
  mpgCity: nullableNum.default(null),
  mpgHighway: nullableNum.default(null),
  doors: nullableNum.default(null),
  seats: nullableNum.default(null),
  description: z.string().trim().nullish().transform((v) => v || null),
  features: z.array(z.string().trim().min(1)).default([]),
  photos: z
    .array(z.union([z.string().url(), z.object({ url: z.string().min(1), alt: z.string().optional(), width: z.number().optional(), height: z.number().optional() })]))
    .default([]),
  exterior360Frames: z.array(z.string().min(1)).nullish().transform((v) => (v && v.length ? v : null)),
  exterior360IsDemo: z.boolean().optional(),
  exterior360EmbedUrl: z.string().url().nullish().transform((v) => v || null),
  interior360Url: z.string().url().nullish().transform((v) => v || null),
  historyReportUrl: z.string().url().nullish().transform((v) => v || null),
  featured: z.coerce.boolean().default(false),
  dateAdded: z.string().default(() => new Date().toISOString().slice(0, 10)),
  internalNotes: z.array(z.string()).optional(),
});

export type RawVehicleInput = z.input<typeof vehicleSchema>;

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function normalizeVehicle(raw: unknown): { vehicle: Vehicle | null; errors: string[] } {
  const parsed = vehicleSchema.safeParse(raw);
  if (!parsed.success) {
    return { vehicle: null, errors: parsed.error.issues.map((i) => `${i.path.join(".") || "vehicle"}: ${i.message}`) };
  }
  const d = parsed.data;
  const name = [d.year, d.make, d.model, d.trim].filter(Boolean).join(" ");
  const photos = d.photos.map((p, i) =>
    typeof p === "string"
      ? { url: p, alt: `${name}, photo ${i + 1} of ${d.photos.length}` }
      : { url: p.url, alt: p.alt || `${name}, photo ${i + 1} of ${d.photos.length}`, width: p.width, height: p.height },
  );
  const vehicle: Vehicle = {
    ...d,
    id: d.id ?? d.stockNumber.toLowerCase(),
    slug: d.slug ?? slugify(`${d.year}-${d.make}-${d.model}-${d.stockNumber}`),
    price: d.price ?? null,
    salePrice: d.salePrice ?? null,
    mpgCity: d.mpgCity ?? null,
    mpgHighway: d.mpgHighway ?? null,
    doors: d.doors ?? null,
    seats: d.seats ?? null,
    photos,
  };
  return { vehicle, errors: [] };
}
