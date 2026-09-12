import Image from "next/image";
import Link from "next/link";
import { Gauge, Fuel, Cog, Camera, Rotate3d, Hash, Palette } from "lucide-react";
import type { VehicleSummary } from "@/lib/inventory/summary";
import { displayPrice, formatMiles, formatPrice, statusLabel, vehicleTitle } from "@/lib/format";
import { FavoriteButton, CompareToggle, ShareButton } from "./VehicleActions";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { estimate } from "@/lib/finance";
import { business } from "@/config/business";

/**
 * Inventory card used on the homepage, inventory grid/list, similar vehicles, and saved pages.
 * Server-renderable; interactive bits (favorite/compare/share) are small client islands.
 */
export function VehicleCard({
  v,
  layout = "grid",
  priority = false,
  headingLevel: H = "h3",
}: {
  v: VehicleSummary;
  layout?: "grid" | "list";
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const href = `/inventory/${v.slug}`;
  const title = vehicleTitle(v);
  const price = displayPrice(v);
  const est = price ? Math.round(estimate({ price, down: Math.round(price * 0.1), apr: business.financing.calculatorExampleApr, months: 72 }).payment) : null;
  const list = layout === "list";
  const specs = [
    { icon: Gauge, label: "Mileage", value: formatMiles(v.mileage) },
    { icon: Cog, label: "Drivetrain", value: v.drivetrain ?? v.transmission ?? "—" },
    { icon: Fuel, label: "Fuel", value: v.fuelType ?? "—" },
    { icon: Palette, label: "Exterior", value: v.exteriorColor ?? "—" },
  ];

  return (
    <article
      className={`group relative flex overflow-hidden rounded-[var(--radius-md)] border border-line bg-white shadow-[var(--shadow-card)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-raised)] motion-reduce:hover:translate-y-0 ${list ? "flex-col sm:flex-row" : "flex-col"}`}
    >
      <div className={`relative overflow-hidden bg-surface-2 ${list ? "sm:w-[42%] sm:shrink-0" : ""}`}>
        <Link href={href} tabIndex={-1} aria-hidden className="block">
          <div className="relative aspect-[4/3]">
            {v.photos[0] ? (
              <Image
                src={v.photos[0].url}
                alt={v.photos[0].alt}
                fill
                sizes={list ? "(min-width: 640px) 40vw, 100vw" : "(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw"}
                priority={priority}
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">Photos coming soon</div>
            )}
          </div>
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {v.status !== "available" && <Badge tone={v.status === "pending" ? "warning" : "navy"}>{statusLabel[v.status]}</Badge>}
          {v.photoCount > 0 && (
            <Badge tone="dark">
              <Camera className="size-3.5" aria-hidden />
              <span className="tabular">{v.photoCount}</span>
              <span className="sr-only"> photos</span>
            </Badge>
          )}
          {v.has360 && (
            <Badge tone="dark">
              <Rotate3d className="size-3.5" aria-hidden /> 360°
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton id={v.id} label={title} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <H className="font-display text-xl font-bold leading-tight text-ink">
              <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-3 focus-visible:after:outline-accent-text focus-visible:after:rounded-[var(--radius-md)]">
                {title}
              </Link>
            </H>
            <p className="mt-0.5 truncate text-sm text-slate">{v.trim ?? v.bodyStyle ?? " "}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-2xl font-bold leading-none text-ink tabular">{formatPrice(price)}</p>
            {v.salePrice != null && v.price != null && v.salePrice < v.price && <p className="mt-1 text-xs text-muted line-through tabular">{formatPrice(v.price)}</p>}
            {est && (
              <Link href={`${href}#payment`} className="relative z-10 mt-1 inline-block text-xs font-medium text-navy-700 underline-offset-2 hover:underline">
                Est. <span className="tabular">${est.toLocaleString("en-US")}</span>/mo<span className="sr-only"> — see payment calculator</span>
              </Link>
            )}
          </div>
        </div>

        <dl className={`mt-4 grid gap-x-4 gap-y-2 text-sm ${list ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
          {specs.map((s) => (
            <div key={s.label} className="flex min-w-0 items-center gap-2">
              <s.icon className="size-4 shrink-0 text-muted" aria-hidden />
              <dt className="sr-only">{s.label}</dt>
              <dd className="truncate text-slate">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Hash className="size-3.5" aria-hidden /> Stock <span className="font-semibold text-slate tabular">{v.stockNumber}</span>
          </span>
          <span className={`inline-flex items-center gap-1.5 font-semibold ${v.status === "available" ? "text-success" : "text-warning"}`}>
            <span className={`size-2 rounded-full ${v.status === "available" ? "bg-success" : "bg-warning"}`} aria-hidden />
            {statusLabel[v.status]}
          </span>
        </div>

        <div className="relative z-10 mt-auto flex items-center justify-between gap-2 pt-3">
          <CompareToggle id={v.id} label={title} />
          <ShareButton path={href} title={title} />
        </div>
        {/* flex-wrap (not grid-cols-2) so a narrow card drops "Check Availability" to its own full-width
            row instead of clipping it — grid would force both into a fixed 50% track. */}
        <div className="relative z-10 mt-2 flex flex-wrap gap-2">
          <Link href={href} className={buttonClasses("outline", "md", "flex-1 min-w-[132px]")}>
            View Details
          </Link>
          <Link href={`${href}#availability`} className={buttonClasses("primary", "md", "flex-1 min-w-[168px]")}>
            Check Availability
          </Link>
        </div>
      </div>
    </article>
  );
}

export function VehicleCardSkeleton({ layout = "grid" }: { layout?: "grid" | "list" }) {
  return (
    <div aria-hidden className={`flex overflow-hidden rounded-[var(--radius-md)] border border-line bg-white ${layout === "list" ? "flex-col sm:flex-row" : "flex-col"}`}>
      <div className={`aspect-[4/3] animate-pulse bg-surface-2 ${layout === "list" ? "sm:w-[42%]" : ""}`} />
      <div className="flex-1 space-y-3 p-5">
        <div className="flex justify-between gap-4">
          <div className="h-6 w-1/2 animate-pulse rounded bg-surface-2" />
          <div className="h-6 w-20 animate-pulse rounded bg-surface-2" />
        </div>
        <div className="h-4 w-1/3 animate-pulse rounded bg-surface-2" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-surface-2" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-4">
          <div className="h-11 animate-pulse rounded bg-surface-2" />
          <div className="h-11 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
