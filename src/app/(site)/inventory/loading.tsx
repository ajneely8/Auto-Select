import { VehicleCardSkeleton } from "@/components/inventory/VehicleCard";

export default function Loading() {
  return (
    <div className="bg-surface" aria-busy="true" aria-label="Loading inventory">
      <div className="container-page pb-16 pt-8">
        <div className="mb-6 h-9 w-2/3 max-w-md animate-pulse rounded bg-surface-2" />
        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <div className="hidden h-[480px] animate-pulse rounded-[var(--radius-md)] border border-line bg-white lg:block" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
