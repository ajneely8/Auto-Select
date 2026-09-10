import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { business, fullAddress, mapsLinks } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { getVehicleById, isPublished } from "@/lib/inventory/repository";
import { vehicleFullName } from "@/lib/format";
import { PageHero, Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AppointmentForm, type AppointmentKind } from "@/components/forms/AppointmentForm";

export const metadata = pageMetadata({
  title: "Book an Appointment",
  description:
    "Request a test drive, dealership visit, phone consultation, or service appointment with Auto Select in Live Oak, TX. Pick a time during business hours and a team member will confirm it with you.",
  path: "/schedule",
});

// Kept here (not imported from the client form module) so this server component can read the values.
const KINDS: AppointmentKind[] = ["test-drive", "dealership-visit", "phone-consultation", "service"];

const steps = [
  { title: "Choose the type and time", body: "Pick what you'd like to schedule and a day and time during business hours." },
  {
    title: "A team member confirms",
    body: "We review every request and confirm it with you by your preferred contact method. If your time isn't available, we'll suggest another.",
  },
  { title: "Visit or talk with us", body: "Come by our Live Oak location, or we'll call you at the scheduled time for a phone consultation." },
];

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const sp = await searchParams;
  const typeParam = typeof sp.type === "string" ? sp.type : undefined;
  const vehicleParam = typeof sp.vehicle === "string" ? sp.vehicle.trim() : "";

  // Only pass through IDs that match a vehicle currently offered for sale.
  const found = /^[\w-]{1,40}$/.test(vehicleParam) ? await getVehicleById(vehicleParam) : null;
  const vehicle = found && isPublished(found) ? found : null;
  const defaultKind = KINDS.find((k) => k === typeParam) ?? (vehicle ? "test-drive" : undefined);

  return (
    <>
      <PageHero
        eyebrow="Appointments"
        title="Book an Appointment"
        intro="Choose a day and time that works for you. Requests are confirmed by a member of our team, usually by your preferred contact method."
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Book an Appointment", path: "/schedule" }]} />}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
          <div className="grid content-start gap-10">
            <section aria-labelledby="how-heading" data-reveal>
              <p className="eyebrow mb-2">How it works</p>
              <h2 id="how-heading" className="font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]">
                How appointment requests work
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
            </section>

            <section aria-labelledby="hours-heading" className="rounded-[var(--radius-md)] border border-line bg-surface p-6" data-reveal>
              <h2 id="hours-heading" className="flex items-center gap-2 text-lg font-bold text-ink">
                <Clock className="size-5 text-navy-700" aria-hidden />
                Business hours
              </h2>
              <dl className="mt-3 grid gap-1.5">
                {business.hoursSummary.map((h) => (
                  <div key={h.label} className="flex flex-wrap justify-between gap-x-4 border-b border-line pb-1.5 last:border-b-0 last:pb-0">
                    <dt className="font-semibold text-ink">{h.label}</dt>
                    <dd className="text-slate tabular">{h.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 grid gap-1 border-t border-line pt-4 text-slate">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 size-4 shrink-0 text-navy-700" aria-hidden />
                  <address className="not-italic">{fullAddress}</address>
                </div>
                <a
                  href={mapsLinks.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="directions"
                  className="inline-flex min-h-11 items-center gap-2 self-start font-semibold text-navy-700 underline-offset-2 hover:underline"
                >
                  <Navigation className="size-4" aria-hidden />
                  Get directions<span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </section>
          </div>

          <div id="book" className="self-start rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Request a time</h2>
            <p className="mt-2 leading-relaxed text-slate">Your appointment isn&apos;t final until our team confirms it with you.</p>
            <a href={`tel:${business.phone.e164}`} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-slate hover:text-ink">
              <Phone className="size-4 text-navy-700" aria-hidden />
              Prefer to talk? Call <span className="font-semibold text-navy-700 underline underline-offset-2">{business.phone.display}</span>
            </a>
            <div className="mt-5">
              <AppointmentForm
                defaultKind={defaultKind}
                vehicleId={vehicle?.id}
                vehicleLabel={vehicle ? `${vehicleFullName(vehicle)} · Stock ${vehicle.stockNumber}` : undefined}
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
