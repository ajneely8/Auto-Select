import { Check, Info, Phone } from "lucide-react";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { getVehicleById, isPublished } from "@/lib/inventory/repository";
import { vehicleFullName } from "@/lib/format";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { DeliveryForm } from "@/components/forms/DeliveryForm";

export const metadata = pageMetadata({
  title: "Home & Office Vehicle Delivery",
  description:
    "Request delivery of your Auto Select vehicle to your home or office. Our Live Oak team reviews every request and confirms availability, timing, and any fees with you before anything is scheduled.",
  path: "/delivery",
});

const steps = [
  {
    title: "Choose your vehicle",
    body: "Find a vehicle in our inventory and let us know you'd like it delivered. If you're financing or trading in, we take care of those steps first.",
  },
  {
    title: "Send a delivery request",
    body: "Share the delivery address and a preferred window. Our team reviews every request — nothing is scheduled until we confirm it with you.",
  },
  {
    title: "Confirm the details",
    body: "We contact you to confirm availability, eligibility, the delivery date and time, and any fees before scheduling.",
  },
  {
    title: "Meet your vehicle",
    body: "At delivery, we walk through the vehicle with you, complete the remaining paperwork, and hand over the keys.",
  },
];

const atDelivery = [
  "A walk-around so you can check the vehicle's condition and ask questions",
  "Time to review and sign the remaining purchase documents",
  "A quick orientation to the controls and features you'll use most",
  "All keys, plus any manuals or records that come with the vehicle",
];

const haveReady = [
  "A valid driver's license",
  "Proof of insurance for the vehicle",
  "Your down payment or remaining balance, arranged as agreed with our team",
  "If you're trading in, the title or loan details, registration, and all keys",
];

const h2 = "font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]";

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-slate">
          <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function DeliveryPage({ searchParams }: PageProps<"/delivery">) {
  const sp = await searchParams;
  const vehicleParam = typeof sp.vehicle === "string" ? sp.vehicle.trim() : "";
  // Only pass through IDs that match a vehicle currently offered for sale.
  const found = /^[\w-]{1,40}$/.test(vehicleParam) ? await getVehicleById(vehicleParam) : null;
  const vehicle = found && isPublished(found) ? found : null;

  return (
    <>
      <PageHero
        eyebrow="Delivery"
        title="Your next vehicle, delivered to your door"
        intro="Skip the extra trip. Request home or office delivery and our team will confirm the details with you before anything is scheduled."
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Delivery", path: "/delivery" }]} />}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#request" size="lg">
            Request delivery
          </ButtonLink>
          <ButtonLink href="/inventory" variant="outline-light" size="lg">
            Browse inventory
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
          <div className="grid content-start gap-12">
            <section aria-labelledby="how-heading" data-reveal>
              <p className="eyebrow mb-2">How it works</p>
              <h2 id="how-heading" className={h2}>
                How home and office delivery works
              </h2>
              <ol className="mt-6 grid gap-6">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-navy-900 font-display text-base font-bold text-white tabular">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold leading-snug text-ink">{s.title}</h3>
                      <p className="mt-1 leading-relaxed text-slate">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex items-start gap-3 rounded-[var(--radius-sm)] border border-line-strong bg-surface p-4 leading-relaxed text-ink">
                <Info className="mt-1 size-4 shrink-0 text-navy-700" aria-hidden />
                <span>Availability, eligibility, timing, distance, and fees must be confirmed by Auto Select.</span>
              </p>
            </section>

            <section aria-labelledby="expect-heading" data-reveal>
              <h2 id="expect-heading" className={h2}>
                What to expect at delivery
              </h2>
              <p className="mt-3 leading-relaxed text-slate">Plan to set aside some time so nothing feels rushed. A typical delivery includes:</p>
              <div className="mt-4">
                <CheckList items={atDelivery} />
              </div>
            </section>

            <section aria-labelledby="paperwork-heading" className="rounded-[var(--radius-md)] border border-line p-6" data-reveal>
              <h2 id="paperwork-heading" className="text-xl font-bold text-ink">
                Paperwork and what to have ready
              </h2>
              <p className="mt-2 leading-relaxed text-slate">
                Before delivery day, we&apos;ll let you know which documents you can review ahead of time and which need your signature in person.
              </p>
              <div className="mt-4">
                <CheckList items={haveReady} />
              </div>
            </section>
          </div>

          <div id="request" className="self-start rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Request delivery</h2>
            <p className="mt-2 leading-relaxed text-slate">This is a request, not a booking. We&apos;ll contact you to confirm the details.</p>
            <a href={`tel:${business.phone.e164}`} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-slate hover:text-ink">
              <Phone className="size-4 text-navy-700" aria-hidden />
              Prefer to talk? Call <span className="font-semibold text-navy-700 underline underline-offset-2">{business.phone.display}</span>
            </a>
            <div className="mt-5">
              <DeliveryForm vehicleId={vehicle?.id} vehicleLabel={vehicle ? `${vehicleFullName(vehicle)} · Stock ${vehicle.stockNumber}` : undefined} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
