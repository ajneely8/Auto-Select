import type { Vehicle } from "@/lib/types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("en-US");

export const formatPrice = (n: number | null | undefined) => (n == null ? "Call for Price" : usd.format(n));
export const formatMiles = (n: number) => `${int.format(n)} mi`;
export const formatNumber = (n: number) => int.format(n);

export function vehicleTitle(v: Pick<Vehicle, "year" | "make" | "model">) {
  return `${v.year} ${v.make} ${v.model}`;
}

export function vehicleFullName(v: Pick<Vehicle, "year" | "make" | "model" | "trim">) {
  return v.trim ? `${vehicleTitle(v)} ${v.trim}` : vehicleTitle(v);
}

/** Price the customer should see: sale price when present and lower. */
export function displayPrice(v: Pick<Vehicle, "price" | "salePrice">) {
  if (v.salePrice != null && v.price != null && v.salePrice < v.price) return v.salePrice;
  return v.price ?? v.salePrice;
}

export function maskVin(vin: string) {
  return vin.length > 8 ? `${vin.slice(0, 3)}${"•".repeat(vin.length - 9)}${vin.slice(-6)}` : vin;
}

export const statusLabel: Record<Vehicle["status"], string> = {
  available: "Available",
  pending: "Sale Pending",
  sold: "Sold",
  "in-transit": "In Transit",
};

export function telHref(e164: string) {
  return `tel:${e164}`;
}
