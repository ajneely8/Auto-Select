"use client";

import Link from "next/link";
import { Heart, BookmarkX, Search } from "lucide-react";
import { useFavorites, useSavedSearches } from "@/lib/shopping/store";
import { useVehicleSummaries } from "@/lib/shopping/useVehicleSummaries";
import { VehicleCard, VehicleCardSkeleton } from "@/components/inventory/VehicleCard";
import { buttonClasses } from "@/components/ui/Button";

export function SavedList() {
  const { ids } = useFavorites();
  const { vehicles, loading } = useVehicleSummaries(ids);
  const { searches, remove } = useSavedSearches();
  const unavailable = ids.length - vehicles.length;

  return (
    <div className="grid gap-12">
      <section aria-labelledby="saved-vehicles">
        <h2 id="saved-vehicles" className="font-display text-2xl font-bold">
          Saved vehicles <span className="text-muted tabular">({vehicles.length})</span>
        </h2>
        {loading ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ids.slice(0, 3).map((id) => (
              <VehicleCardSkeleton key={id} />
            ))}
          </div>
        ) : vehicles.length ? (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <li key={v.id} className="flex [&>article]:w-full">
                <VehicleCard v={v} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-[var(--radius-md)] border border-line bg-white p-8 text-center">
            <Heart className="mx-auto size-7 text-navy-700" aria-hidden />
            <p className="mt-3 font-semibold text-ink">No saved vehicles yet</p>
            <p className="mt-1 text-sm text-slate">Tap the heart on any vehicle to save it here. Saved vehicles stay on this device.</p>
            <Link href="/inventory" className={buttonClasses("primary", "md", "mt-5")}>
              Browse inventory
            </Link>
          </div>
        )}
        {!loading && unavailable > 0 && <p className="mt-3 text-sm text-muted">{unavailable === 1 ? "1 saved vehicle is" : `${unavailable} saved vehicles are`} no longer listed.</p>}
      </section>

      <section aria-labelledby="saved-searches">
        <h2 id="saved-searches" className="font-display text-2xl font-bold">
          Saved searches
        </h2>
        {searches.length ? (
          <ul className="mt-4 divide-y divide-line rounded-[var(--radius-md)] border border-line bg-white">
            {searches.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 p-4">
                <Link href={`/inventory?${s.query}`} className="inline-flex min-w-0 items-center gap-2 font-semibold text-navy-700 hover:underline">
                  <Search className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{s.name}</span>
                </Link>
                <button type="button" onClick={() => remove(s.id)} className="inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-surface hover:text-ink" aria-label={`Delete saved search ${s.name}`}>
                  <BookmarkX className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-slate">
            Apply filters on the{" "}
            <Link href="/inventory" className="font-semibold text-navy-700 underline underline-offset-2">
              inventory page
            </Link>{" "}
            and choose “Save search” to keep them here.
          </p>
        )}
      </section>
    </div>
  );
}
