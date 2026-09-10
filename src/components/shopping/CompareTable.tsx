"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { X, Columns3 } from "lucide-react";
import { useCompare, MAX_COMPARE } from "@/lib/shopping/store";
import { useVehicleSummaries } from "@/lib/shopping/useVehicleSummaries";
import { displayPrice, formatNumber, formatPrice, vehicleFullName } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import type { VehicleSummary } from "@/lib/inventory/summary";

const rows: [string, (v: VehicleSummary) => string][] = [
  ["Price", (v) => formatPrice(displayPrice(v))],
  ["Mileage", (v) => `${formatNumber(v.mileage)} mi`],
  ["Body style", (v) => v.bodyStyle ?? "—"],
  ["Engine", (v) => v.engine ?? "—"],
  ["Transmission", (v) => v.transmission ?? "—"],
  ["Drivetrain", (v) => v.drivetrain ?? "—"],
  ["Fuel type", (v) => v.fuelType ?? "—"],
  ["MPG (city/hwy)", (v) => (v.mpgCity && v.mpgHighway ? `${v.mpgCity} / ${v.mpgHighway}` : "—")],
  ["Seating", (v) => (v.seats ? String(v.seats) : "—")],
  ["Exterior", (v) => v.exteriorColor ?? "—"],
  ["Interior", (v) => v.interiorColor ?? "—"],
  ["Features", (v) => (v.features.length ? v.features.join(", ") : "—")],
  ["Stock #", (v) => v.stockNumber],
];

export function CompareTable() {
  const params = useSearchParams();
  const { ids, toggle } = useCompare();
  // A shared /compare?ids=… link shows those vehicles; otherwise use this browser's selection.
  const fromUrl = (params.get("ids") ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, MAX_COMPARE);
  const list = fromUrl.length ? fromUrl : ids;
  const { vehicles, loading } = useVehicleSummaries(list);

  useEffect(() => {
    const qs = ids.length ? `?ids=${ids.join(",")}` : "";
    if (!fromUrl.length || fromUrl.join(",") === ids.join(",")) window.history.replaceState(null, "", `/compare${qs}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);

  if (!loading && vehicles.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-line bg-white p-8 text-center">
        <Columns3 className="mx-auto size-8 text-navy-700" aria-hidden />
        <h2 className="mt-3 font-display text-2xl font-bold">No vehicles selected</h2>
        <p className="mt-2 text-slate">Check “Compare” on up to {MAX_COMPARE} vehicles in our inventory to see them side by side.</p>
        <Link href="/inventory" className={buttonClasses("primary", "md", "mt-5")}>
          Browse inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line bg-white">
      <table className="w-full min-w-[640px] table-fixed text-sm">
        <caption className="sr-only">Side-by-side vehicle comparison</caption>
        <thead>
          <tr>
            <td className="w-40 border-b border-line p-4" />
            {vehicles.map((v) => (
              <th key={v.id} scope="col" className="border-b border-l border-line p-4 text-left align-top font-normal">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] bg-surface-2">
                  {v.photos[0] && <Image src={v.photos[0].url} alt={v.photos[0].alt} fill sizes="300px" className="object-cover" />}
                </div>
                <Link href={`/inventory/${v.slug}`} className="mt-3 block font-display text-lg font-bold leading-tight text-ink hover:underline">
                  {vehicleFullName(v)}
                </Link>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/inventory/${v.slug}#availability`} className={buttonClasses("primary", "sm")}>
                    Check availability
                  </Link>
                  {ids.includes(v.id) && (
                    <button type="button" onClick={() => toggle(v.id)} className="inline-flex min-h-9 items-center gap-1 px-2 text-sm text-slate underline" aria-label={`Remove ${vehicleFullName(v)} from comparison`}>
                      <X className="size-3.5" aria-hidden /> Remove
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, get]) => (
            <tr key={label} className="even:bg-surface/60">
              <th scope="row" className="border-b border-line px-4 py-3 text-left font-medium text-muted">
                {label}
              </th>
              {vehicles.map((v) => (
                <td key={v.id} className="border-b border-l border-line px-4 py-3 font-semibold text-ink">
                  {get(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
