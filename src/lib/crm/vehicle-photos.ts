import "server-only";
import { getVehicleById } from "@/lib/inventory/repository";
import { vehicleFullName, displayPrice } from "@/lib/format";
import type { Lead, Vehicle } from "@/lib/types";

export interface LeadVehiclePhoto {
  url: string;
  alt: string;
  name: string;
  price: number | null;
  mileage: number;
  status: Vehicle["status"];
  slug: string;
}

/** One lookup per distinct vehicle referenced by `leads`, not one per lead — a busy inbox can have many leads pointing at the same car. */
export async function vehiclePhotosForLeads(leads: Lead[]): Promise<Record<string, LeadVehiclePhoto>> {
  const ids = [...new Set(leads.map((l) => l.vehicleId).filter((id): id is string => !!id))];
  const vehicles = await Promise.all(ids.map((id) => getVehicleById(id)));
  const out: Record<string, LeadVehiclePhoto> = {};
  vehicles.forEach((v, i) => {
    const photo = v?.photos[0];
    if (v && photo) {
      out[ids[i]] = { url: photo.url, alt: photo.alt, name: vehicleFullName(v), price: displayPrice(v), mileage: v.mileage, status: v.status, slug: v.slug };
    }
  });
  return out;
}
