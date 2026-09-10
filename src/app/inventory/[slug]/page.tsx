import Link from "next/link";
import { notFound } from "next/navigation";
import { Gauge, Cog, Fuel, CarFront, Palette, Armchair, Hash, FileText, Repeat, Truck, BadgeDollarSign, CircleCheck, Info } from "lucide-react";
import { getAllVehicles, getVehicleBySlug, getSimilarVehicles, isPublished } from "@/lib/inventory/repository";
import { toSummary } from "@/lib/inventory/summary";
import { displayPrice, formatMiles, formatPrice, formatNumber, statusLabel, vehicleFullName, vehicleTitle } from "@/lib/format";
import { pageMetadata, vehicleJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { VehicleMedia } from "@/components/vehicle/VehicleMedia";
import { PaymentCalculator } from "@/components/vehicle/PaymentCalculator";
import { LeadCard } from "@/components/vehicle/LeadCard";
import { VinDisplay, RecentlyViewed, MobileVdpBar } from "@/components/vehicle/VehicleClientBits";
import { FavoriteButton, ShareButton } from "@/components/inventory/VehicleActions";
import { VehicleCard } from "@/components/inventory/VehicleCard";
import { AlertSignup } from "@/components/inventory/AlertSignup";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { showDemo360 } from "@/config/site";

export async function generateStaticParams() {
  return (await getAllVehicles()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/inventory/[slug]">) {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) return { title: "Vehicle not found" };
  const name = vehicleFullName(v);
  const price = displayPrice(v);
  return pageMetadata({
    title: `${v.status === "sold" ? "Sold: " : ""}Used ${name} for Sale in Live Oak, TX`,
    description: `${name} with ${formatNumber(v.mileage)} miles${price ? `, ${formatPrice(price)}` : ""}${v.exteriorColor ? `, ${v.exteriorColor.toLowerCase()} exterior` : ""}. Stock ${v.stockNumber}. Check availability, schedule a test drive, or ask about delivery at Auto Select near San Antonio.`,
    path: `/inventory/${v.slug}`,
    image: v.photos[0]?.url,
    noindex: v.status === "sold",
  });
}

export default async function VehicleDetailPage({ params }: PageProps<"/inventory/[slug]">) {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) notFound();

  const sold = !isPublished(v);
  const name = vehicleFullName(v);
  const title = vehicleTitle(v);
  const price = displayPrice(v);
  const similar = (await getSimilarVehicles(v, 3)).map(toSummary);
  const use360Frames = v.exterior360Frames && (!v.exterior360IsDemo || showDemo360) ? v.exterior360Frames : null;

  const quickSpecs = [
    { icon: Gauge, label: "Mileage", value: formatMiles(v.mileage) },
    { icon: Cog, label: "Transmission", value: v.transmission },
    { icon: CarFront, label: "Drivetrain", value: v.drivetrain },
    { icon: Fuel, label: "Fuel", value: v.fuelType },
    { icon: Palette, label: "Exterior", value: v.exteriorColor },
    { icon: Armchair, label: "Interior", value: v.interiorColor },
  ];

  const specRows: [string, string | number | null][] = [
    ["Year", v.year],
    ["Make", v.make],
    ["Model", v.model],
    ["Trim", v.trim],
    ["Body style", v.bodyStyle],
    ["Condition", v.condition === "used" ? "Used" : v.condition === "new" ? "New" : "Certified pre-owned"],
    ["Mileage", `${formatNumber(v.mileage)} miles`],
    ["Engine", v.engine],
    ["Transmission", v.transmission],
    ["Drivetrain", v.drivetrain],
    ["Fuel type", v.fuelType],
    ["MPG (city / highway)", v.mpgCity && v.mpgHighway ? `${v.mpgCity} / ${v.mpgHighway}` : null],
    ["Doors", v.doors],
    ["Seating", v.seats],
    ["Exterior color", v.exteriorColor],
    ["Interior color", v.interiorColor],
    ["Stock number", v.stockNumber],
  ];

  return (
    <>
      <JsonLd data={vehicleJsonLd(v)} />
      <div className="bg-surface pb-24 lg:pb-16">
        <div className="container-page pt-6">
          <Breadcrumbs items={[{ name: "Inventory", path: "/inventory" }, ...(v.bodyStyle ? [{ name: v.bodyStyle, path: `/inventory?body=${encodeURIComponent(v.bodyStyle)}` }] : []), { name: title, path: `/inventory/${v.slug}` }]} />

          {sold && (
            <div role="status" className="mb-5 flex items-start gap-3 rounded-[var(--radius-md)] border border-[#f0d9a6] bg-warning-soft p-4 text-warning">
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p className="text-sm">
                <strong>This vehicle has been sold.</strong> Browse similar vehicles below, or{" "}
                <Link href="/find-a-vehicle" className="font-semibold underline underline-offset-2">
                  ask us to find one like it
                </Link>
                .
              </p>
            </div>
          )}

          {/* Title row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={v.status === "available" ? "success" : "warning"}>{statusLabel[v.status]}</Badge>
                <Badge>{v.condition === "used" ? "Used" : v.condition}</Badge>
                {v.bodyStyle && <Badge>{v.bodyStyle}</Badge>}
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-[2.5rem]">{name}</h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate">
                <span className="tabular">{formatMiles(v.mileage)}</span>
                <span className="inline-flex items-center gap-1">
                  <Hash className="size-3.5" aria-hidden /> Stock <span className="font-semibold text-ink tabular">{v.stockNumber}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  VIN <VinDisplay vin={v.vin} />
                </span>
              </p>
            </div>
            <div className="flex items-end justify-between gap-4 lg:flex-col lg:items-end">
              <div id="vdp-price" className="text-left lg:text-right">
                <p className="font-display text-4xl font-bold leading-none tabular">{formatPrice(price)}</p>
                {v.salePrice != null && v.price != null && v.salePrice < v.price && <p className="mt-1 text-sm text-muted line-through tabular">{formatPrice(v.price)}</p>}
                <a href="#payment" className="mt-1.5 inline-block text-sm font-medium text-navy-700 underline-offset-2 hover:underline">
                  Estimate your payment
                </a>
              </div>
              <div className="flex gap-2">
                <FavoriteButton id={v.id} label={title} variant="inline" />
                <ShareButton path={`/inventory/${v.slug}`} title={name} variant="inline" />
              </div>
            </div>
          </div>

          {/* Mobile order: media → lead card → details. Desktop: lead card is a sticky right column spanning both rows. */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-8 lg:gap-y-0">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <VehicleMedia
                photos={v.photos}
                title={name}
                stockNumber={v.stockNumber}
                exterior360Frames={use360Frames}
                exterior360EmbedUrl={v.exterior360EmbedUrl ?? null}
                interior360Url={v.interior360Url}
                isDemo360={!!v.exterior360IsDemo}
              />

              {/* Quick specs */}
              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-3">
                {quickSpecs.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 bg-white p-4">
                    <s.icon className="size-5 shrink-0 text-navy-700" aria-hidden />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted">{s.label}</dt>
                      <dd className="truncate text-sm font-semibold text-ink">{s.value ?? "Ask us"}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <aside aria-label="Contact about this vehicle" className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <div className="lg:sticky lg:top-[88px]">
                <LeadCard vehicleId={v.id} vehicleLabel={name} stockNumber={v.stockNumber} sold={sold} />
              </div>
            </aside>

            <div className="min-w-0 lg:col-start-1 lg:row-start-2">
              <section aria-labelledby="overview-heading" className="mt-4 lg:mt-10">
                <h2 id="overview-heading" className="font-display text-2xl font-bold">
                  Vehicle overview
                </h2>
                {v.description ? <p className="mt-3 max-w-3xl leading-relaxed text-slate">{v.description}</p> : <p className="mt-3 text-slate">Contact us for a full description of this vehicle.</p>}
              </section>

              <section aria-labelledby="features-heading" className="mt-10">
                <h2 id="features-heading" className="font-display text-2xl font-bold">
                  Features &amp; equipment
                </h2>
                {v.features.length ? (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {v.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-slate">
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className={`${v.features.length ? "mt-4" : "mt-3"} text-sm text-slate`}>
                  {v.features.length ? "Looking for a specific feature? " : "A full equipment list isn't posted yet. "}
                  <a href="#availability" className="font-semibold text-navy-700 underline underline-offset-2">
                    Ask us
                  </a>{" "}
                  and we&apos;ll confirm what this vehicle has.
                </p>
              </section>

              <section aria-labelledby="specs-heading" className="mt-10">
                <h2 id="specs-heading" className="font-display text-2xl font-bold">
                  Specifications
                </h2>
                <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-line bg-white">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Specifications for the {name}</caption>
                    <tbody>
                      {specRows
                        .filter(([, val]) => val != null && val !== "")
                        .map(([k, val]) => (
                          <tr key={k} className="border-b border-line last:border-b-0 even:bg-surface/60">
                            <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-muted">
                              {k}
                            </th>
                            <td className="px-4 py-3 font-semibold text-ink">{val}</td>
                          </tr>
                        ))}
                      <tr className="border-b border-line last:border-b-0">
                        <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-muted">
                          VIN
                        </th>
                        <td className="px-4 py-2">
                          <VinDisplay vin={v.vin} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {v.historyReportUrl && (
                  <a href={v.historyReportUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-line-strong bg-white px-4 text-sm font-semibold hover:border-ink">
                    <FileText className="size-4" aria-hidden /> View vehicle history report<span className="sr-only"> (opens in new tab)</span>
                  </a>
                )}
              </section>

              <section id="payment" aria-labelledby="payment-heading" className="mt-10 scroll-mt-28 rounded-[var(--radius-md)] border border-line bg-white p-5 sm:p-6">
                <h2 id="payment-heading" className="flex items-center gap-2 font-display text-2xl font-bold">
                  <BadgeDollarSign className="size-6 text-navy-700" aria-hidden /> Estimate your payment
                </h2>
                <p className="mb-5 mt-1 text-sm text-slate">Adjust the numbers to see how down payment, trade-in, and term affect a monthly estimate.</p>
                <PaymentCalculator price={price} />
              </section>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[var(--radius-md)] border border-line bg-white p-5">
                  <Repeat className="size-6 text-navy-700" aria-hidden />
                  <h2 className="mt-2 font-display text-xl font-bold">Have a trade-in?</h2>
                  <p className="mt-1 text-sm text-slate">Get a preliminary estimate online. Final value is confirmed after a quick in-person inspection.</p>
                  <ButtonLink href="/trade-in" variant="outline" className="mt-4">
                    Value my trade
                  </ButtonLink>
                </div>
                <div className="rounded-[var(--radius-md)] border border-line bg-white p-5">
                  <Truck className="size-6 text-navy-700" aria-hidden />
                  <h2 className="mt-2 font-display text-xl font-bold">Prefer delivery?</h2>
                  <p className="mt-1 text-sm text-slate">Ask about home or office delivery. Availability, eligibility, timing, distance, and fees are confirmed by Auto Select.</p>
                  <ButtonLink href={`/delivery?vehicle=${v.id}`} variant="outline" className="mt-4">
                    Request delivery
                  </ButtonLink>
                </div>
              </div>

              {!sold && (
                <div className="mt-6 rounded-[var(--radius-md)] border border-line bg-white p-5">
                  <AlertSignup vehicleId={v.id} title="Get price-change updates for this vehicle" />
                </div>
              )}

              <p className="mt-8 text-xs leading-relaxed text-muted">
                Price excludes tax, title, license, registration, and dealer fees. Vehicle details, equipment, and photos are provided in good faith but may contain
                errors; please confirm all information, availability, and pricing with Auto Select before purchase. Mileage is approximate at the time of listing.
              </p>
            </div>
          </div>

          {similar.length > 0 && (
            <section aria-labelledby="similar-heading" className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <h2 id="similar-heading" className="font-display text-2xl font-bold">
                  Similar vehicles
                </h2>
                <Link href="/inventory" className="text-sm font-semibold text-navy-700 underline-offset-2 hover:underline">
                  View all inventory
                </Link>
              </div>
              <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((s) => (
                  <li key={s.id} className="flex [&>article]:w-full">
                    <VehicleCard v={s} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <RecentlyViewed currentId={v.id} stockNumber={v.stockNumber} make={v.make} model={v.model} year={v.year} bodyStyle={v.bodyStyle} />
        </div>
      </div>
      {!sold && <MobileVdpBar price={price} title={title} />}
    </>
  );
}
