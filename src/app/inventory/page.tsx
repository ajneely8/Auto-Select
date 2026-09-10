import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPublishedVehicles } from "@/lib/inventory/repository";
import { toSummary } from "@/lib/inventory/summary";
import { InventoryExplorer } from "@/components/inventory/InventoryExplorer";
import { VehicleCardSkeleton } from "@/components/inventory/VehicleCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { showDemo360 } from "@/config/site";

export const metadata = pageMetadata({
  title: "Used Cars for Sale in Live Oak, TX",
  description:
    "Browse used cars, trucks, SUVs, and minivans for sale at Auto Select in Live Oak, Texas — near San Antonio. Filter by make, price, mileage, and more, then check availability or schedule a test drive.",
  path: "/inventory",
});

export default async function InventoryPage({ searchParams }: PageProps<"/inventory">) {
  // Rendered per request so filtered URLs (e.g. /inventory?make=Toyota) arrive fully rendered, not as a skeleton.
  const sp = await searchParams;
  // Drop empty params (e.g. "make=&model=" from a no-JS form submit). Other params, including UTM tags, are kept.
  const entries = Object.entries(sp).flatMap(([k, v]) => (v === undefined ? [] : (Array.isArray(v) ? v : [v]).map((x) => [k, x] as [string, string])));
  if (entries.some(([, v]) => v === "")) {
    const clean = new URLSearchParams(entries.filter(([, v]) => v !== "")).toString();
    redirect(clean ? `/inventory?${clean}` : "/inventory");
  }
  const vehicles = (await getPublishedVehicles()).map((v) => {
    const s = toSummary(v);
    if (v.exterior360IsDemo && !showDemo360) s.has360 = false;
    return s;
  });

  return (
    <div className="bg-surface">
      <div className="container-page pb-16 pt-6 sm:pt-8">
        <Breadcrumbs items={[{ name: "Inventory", path: "/inventory" }]} />
        <div className="mb-6 max-w-3xl">
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">Used Vehicles for Sale in Live Oak, TX</h1>
          <p className="mt-2 text-slate">
            Every vehicle below is available to view in Live Oak, near San Antonio. Found one you like? Check availability, schedule a test drive, or ask about
            delivery — and if you don&apos;t see the right fit, we can help you find it.
          </p>
        </div>
        <Suspense fallback={<InventorySkeleton />}>
          <InventoryExplorer vehicles={vehicles} />
        </Suspense>
      </div>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
      <div className="hidden h-[480px] animate-pulse rounded-[var(--radius-md)] border border-line bg-white lg:block" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
