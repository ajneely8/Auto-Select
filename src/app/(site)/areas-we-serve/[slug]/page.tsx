import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeDollarSign, CalendarDays, ChevronDown, Clock, MapPin, Navigation, Phone, Repeat, Truck } from "lucide-react";
import { business, fullAddress } from "@/config/business";
import { showDemo360 } from "@/config/site";
import { areas, directionsFrom, getArea } from "@/content/areas";
import { getFeaturedVehicles, getPublishedVehicles } from "@/lib/inventory/repository";
import { toSummary } from "@/lib/inventory/summary";
import { telHref } from "@/lib/format";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { PageHero, Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { VehicleCard } from "@/components/inventory/VehicleCard";

/** Towns in src/content/areas.ts are prerendered; any other slug hits notFound() below and gets the site's branded 404. */
export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/areas-we-serve/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) return { title: "Area not found", robots: { index: false, follow: true } };
  return pageMetadata({ title: `Used Cars Near ${area.name}, TX`, description: area.description, path: `/areas-we-serve/${area.slug}` });
}

const h2 = "font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]";

export default async function AreaPage({ params }: PageProps<"/areas-we-serve/[slug]">) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const path = `/areas-we-serve/${area.slug}`;
  const directions = directionsFrom(area.name);
  const others = areas.filter((a) => a.slug !== area.slug);

  const [featuredRaw, published] = await Promise.all([getFeaturedVehicles(3), getPublishedVehicles()]);
  const featured = featuredRaw.map((v) => {
    const s = toSummary(v);
    if (v.exterior360IsDemo && !showDemo360) s.has360 = false;
    return s;
  });

  const ways = [
    {
      href: "/financing",
      icon: BadgeDollarSign,
      title: "Get pre-qualified",
      text: `Start the secure financing application from home in ${area.name}. Approval depends on lender requirements.`,
    },
    {
      href: "/trade-in",
      icon: Repeat,
      title: "Value your trade",
      text: "Send your vehicle's details and photos for a preliminary estimate before you visit.",
    },
    {
      href: "/schedule",
      icon: CalendarDays,
      title: "Book a time",
      text: "Request a test drive, a visit, or a phone consultation. We confirm every request with you.",
    },
    {
      href: "/delivery",
      icon: Truck,
      title: "Ask about delivery",
      text: `Request delivery to your home or office in ${area.name}. We confirm availability, timing, and any fees first.`,
    },
  ];

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            tone="dark"
            items={[
              { name: "Areas We Serve", path: "/areas-we-serve" },
              { name: area.name, path },
            ]}
          />
        }
        eyebrow={`Serving ${area.name}, TX`}
        title={`Used cars near ${area.name}, TX`}
        intro={area.intro}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/inventory" size="lg">
            Browse inventory
          </ButtonLink>
          <ButtonLink href={directions} external variant="outline-light" size="lg" data-track="directions">
            <Navigation className="size-4" aria-hidden />
            Directions from {area.name}
            <span className="sr-only"> (opens in new tab)</span>
          </ButtonLink>
        </div>
      </PageHero>

      {featured.length > 0 && (
        <Section labelledBy="area-vehicles-heading">
          <SectionHeader
            id="area-vehicles-heading"
            eyebrow="Available now"
            title="Vehicles you can see in Live Oak"
            intro="A few of the vehicles available right now. Save favorites, compare up to three, or check availability in one click."
            action={
              <ButtonLink href="/inventory" variant="outline">
                View all {published.length} vehicles <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            }
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => (
              <li key={v.id} className="flex [&>article]:w-full" data-reveal>
                <VehicleCard v={v} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="surface" labelledBy="area-local-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow mb-2">For {area.name} buyers</p>
            <h2 id="area-local-heading" className={h2}>
              {area.local.title}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate">{area.local.body}</p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-2">
              {ways.map((w) => (
                <li key={w.href} className="bg-white">
                  <Link href={w.href} className="group flex h-full flex-col gap-2 p-5 hover:bg-surface">
                    <w.icon className="size-6 text-accent-text" aria-hidden />
                    <span className="font-display text-lg font-bold leading-tight text-ink group-hover:underline underline-offset-2">{w.title}</span>
                    <span className="text-sm leading-snug text-slate">{w.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside aria-labelledby="area-visit-heading" className="self-start rounded-[var(--radius-md)] border border-line bg-white p-6 sm:p-8" data-reveal>
            <h2 id="area-visit-heading" className="font-display text-2xl font-bold text-ink">
              Visit us in Live Oak
            </h2>
            <ul className="mt-5 grid gap-4">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">Address</p>
                  <address className="not-italic text-slate">{fullAddress}</address>
                  <a
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track="directions"
                    className="mt-1 inline-block text-sm font-semibold text-navy-700 underline underline-offset-2"
                  >
                    Directions from {area.name}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">Hours</p>
                  {business.hoursSummary.map((h) => (
                    <p key={h.label} className="text-slate">
                      {h.label}: {h.value}
                    </p>
                  ))}
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">Phone</p>
                  <a href={telHref(business.phone.e164)} className="text-slate underline-offset-2 hover:underline">
                    {business.phone.display}
                  </a>
                </div>
              </li>
            </ul>
            <ButtonLink href="/schedule" size="lg" className="mt-6 w-full">
              <CalendarDays className="size-4" aria-hidden /> Book an Appointment
            </ButtonLink>
          </aside>
        </div>
      </Section>

      <Section labelledBy="area-faq-heading">
        <div className="max-w-3xl">
          <h2 id="area-faq-heading" className={h2}>
            Buying from {area.name}: common questions
          </h2>
          <div className="mt-4 border-t border-line">
            {area.faqs.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[1.0625rem] font-semibold text-ink hover:text-navy-700 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-ink" aria-hidden />
                </summary>
                <div className="pb-5 pr-9">
                  <p className="text-[1rem] leading-relaxed text-slate">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
          <p className="mt-6 text-slate">
            More answers about financing, trade-ins, and paperwork are on our{" "}
            <Link href="/faq" className="font-semibold text-navy-700 underline underline-offset-2">
              FAQ page
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section tone="surface" labelledBy="area-others-heading">
        <h2 id="area-others-heading" className={h2}>
          Other areas we serve
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((a) => (
            <li key={a.slug} className="flex">
              <Link
                href={`/areas-we-serve/${a.slug}`}
                className="group flex w-full flex-col rounded-[var(--radius-md)] border border-line bg-white p-5 transition-colors hover:border-ink"
              >
                <span className="font-display text-lg font-bold leading-tight text-ink group-hover:underline underline-offset-2">Used cars near {a.name}</span>
                <span className="mt-1.5 text-sm leading-snug text-slate">{a.summary}</span>
              </Link>
            </li>
          ))}
          <li className="flex">
            <Link
              href="/areas-we-serve"
              className="group flex w-full flex-col justify-center rounded-[var(--radius-md)] border border-line bg-white p-5 transition-colors hover:border-ink"
            >
              <span className="inline-flex items-center gap-1.5 font-display text-lg font-bold leading-tight text-ink group-hover:underline underline-offset-2">
                All areas we serve <ArrowRight className="size-4" aria-hidden />
              </span>
              <span className="mt-1.5 text-sm leading-snug text-slate">Live Oak and the San Antonio area</span>
            </Link>
          </li>
        </ul>
      </Section>

      <JsonLd data={faqJsonLd(area.faqs)} />
    </>
  );
}
