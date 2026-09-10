import { Suspense } from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CompareTable } from "@/components/shopping/CompareTable";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Compare Vehicles",
  description: "Compare up to three Auto Select vehicles side by side — price, mileage, drivetrain, engine, and more.",
  path: "/compare",
  noindex: true,
});

export default function ComparePage() {
  return (
    <div className="bg-surface">
      <div className="container-page py-8 sm:py-10">
        <Breadcrumbs items={[{ name: "Compare", path: "/compare" }]} />
        <h1 className="mb-2 font-display text-3xl font-bold sm:text-4xl">Compare vehicles</h1>
        <p className="mb-6 text-slate">Up to three vehicles, side by side. Details come from our listings — please confirm with our team before you buy.</p>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-[var(--radius-md)] border border-line bg-white" />}>
          <CompareTable />
        </Suspense>
      </div>
    </div>
  );
}
