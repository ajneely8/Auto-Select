"use client";

import { useEffect, useState } from "react";
import type { VehicleSummary } from "@/lib/inventory/summary";

const memo = new Map<string, VehicleSummary | null>();

/** Fetches summaries for the given IDs (cached per page session), preserving the order of `ids`. */
export function useVehicleSummaries(ids: string[]) {
  const key = ids.join(",");
  const [, force] = useState(0);
  const missing = ids.filter((id) => !memo.has(id));
  const loading = missing.length > 0;

  useEffect(() => {
    if (!missing.length) return;
    let cancelled = false;
    fetch(`/api/vehicles?ids=${encodeURIComponent(missing.join(","))}`)
      .then((r) => (r.ok ? r.json() : { vehicles: [] }))
      .then((d: { vehicles: VehicleSummary[] }) => {
        for (const id of missing) memo.set(id, d.vehicles.find((v) => v.id === id) ?? null);
        if (!cancelled) force((n) => n + 1);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const vehicles = ids.map((id) => memo.get(id)).filter((v): v is VehicleSummary => !!v);
  return { vehicles, loading };
}
