import type { Vehicle } from "@/lib/types";
import { displayPrice, vehicleFullName } from "@/lib/format";
import type { AssistantCard } from "./types";

export function toCard(v: Vehicle): AssistantCard {
  return {
    stockNumber: v.stockNumber,
    title: vehicleFullName(v),
    price: displayPrice(v),
    mileage: v.mileage,
    url: `/inventory/${v.slug}`,
    photo: v.photos[0]?.url ?? null,
    photoAlt: v.photos[0]?.alt ?? vehicleFullName(v),
  };
}
