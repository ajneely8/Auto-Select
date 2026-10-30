import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Phone } from "lucide-react";
import { business, fullAddress } from "@/config/business";
import { areas } from "@/content/areas";
import { telHref } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { MapEmbed } from "@/components/contact/MapEmbed";

const townList = new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(areas.map((a) => a.name));

export const metadata = pageMetadata({
  title: "Areas We Serve Near Live Oak, TX",
  description: `Auto Select serves Live Oak and nearby towns, including ${townList}. Find directions and the easiest way to buy from where you live.`,
  path: "/areas-we-serve",
});

export default function AreasPage() {
  return (
    <>
      <PageHero
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Areas We Serve", path: "/areas-we-serve" }]} />}
        eyebrow="Areas we serve"
        title="Used cars for Live Oak and the towns around it"
        intro="We're a family-owned online dealership in Live Oak, just northeast of San Antonio. Wherever you live nearby, you can shop, pre-qualify, and value your trade online before you visit."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/inventory" size="lg">
            Browse inventory
          </ButtonLink>
          <ButtonLink href="/schedule" variant="outline-light" size="lg">
            Book an appointment
          </ButtonLink>
        </div>
      </PageHero>

      <Section labelledBy="areas-list-heading">
        <h2 id="areas-list-heading" className="font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]">
          Towns we serve
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li className="flex" data-reveal>
            <Link
              href="/contact"
              className="group flex w-full flex-col rounded-[var(--radius-md)] border-2 border-navy-900 bg-white p-6 transition-colors hover:bg-surface"
            >
              <span className="eyebrow">Our home</span>
              <span className="mt-1 font-display text-xl font-bold leading-tight text-ink group-hover:underline underline-offset-2">Live Oak</span>
              <span className="mt-2 text-[0.9375rem] leading-relaxed text-slate">Visit us at {fullAddress}.</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                Contact &amp; directions <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
          </li>
          {areas.map((a) => (
            <li key={a.slug} className="flex" data-reveal>
              <Link
                href={`/areas-we-serve/${a.slug}`}
                className="group flex w-full flex-col rounded-[var(--radius-md)] border border-line bg-white p-6 transition-colors hover:border-ink"
              >
                <span className="font-display text-xl font-bold leading-tight text-ink group-hover:underline underline-offset-2">{a.name}</span>
                <span className="mt-2 text-[0.9375rem] leading-relaxed text-slate">{a.summary}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                  Used cars near {a.name} <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface" labelledBy="areas-visit-heading">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div data-reveal>
            <h2 id="areas-visit-heading" className="font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]">
              Don&apos;t see your town?
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate">
              We serve {business.serviceArea}. Browse online, call us, or book a phone consultation, and we&apos;ll help you find the easiest way to buy from where
              you live.
            </p>
            <ul className="mt-6 grid gap-3 text-slate">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <address className="not-italic">{fullAddress}</address>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <a href={telHref(business.phone.e164)} className="font-semibold text-ink underline-offset-2 hover:underline">
                  {business.phone.display}
                </a>
              </li>
            </ul>
            <ButtonLink href="/schedule" size="lg" className="mt-7">
              <CalendarDays className="size-4" aria-hidden /> Book an Appointment
            </ButtonLink>
          </div>
          <MapEmbed />
        </div>
      </Section>
    </>
  );
}
