import { CalendarClock, Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { business, fullAddress, mapsLinks } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContactForm } from "@/components/forms/ContactForm";
import { MapEmbed } from "@/components/contact/MapEmbed";

const weekdayHours = business.hoursSummary[0];

export const metadata = pageMetadata({
  title: "Contact & Directions | Live Oak, TX",
  description: `Contact Auto Select in Live Oak, TX. Call ${business.phone.display}, email our team, or visit us at ${fullAddress}. Open ${weekdayHours.label}, ${weekdayHours.value}.`,
  path: "/contact",
});

const h2 = "font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]";
const iconChip = "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-navy-100 text-navy-700";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the Auto Select team"
        intro="Questions about a vehicle, financing, a trade-in, or delivery? Call, email, or send a message, and a member of our family-owned team will get back to you during business hours."
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Contact", path: "/contact" }]} />}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`tel:${business.phone.e164}`} size="lg">
            <Phone className="size-4" aria-hidden />
            Call {business.phone.display}
          </ButtonLink>
          <ButtonLink href="/schedule" variant="outline-light" size="lg">
            Book an appointment
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
          <div className="grid content-start gap-10">
            <section aria-labelledby="reach-heading" data-reveal>
              <h2 id="reach-heading" className={h2}>
                How to reach us
              </h2>
              <ul className="mt-6 grid gap-6">
                <li className="flex items-start gap-4">
                  <span className={iconChip} aria-hidden>
                    <Phone className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Phone</h3>
                    <a href={`tel:${business.phone.e164}`} className="inline-flex min-h-11 items-center text-lg font-semibold text-ink underline-offset-2 hover:underline">
                      {business.phone.display}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className={iconChip} aria-hidden>
                    <Mail className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Email</h3>
                    <a href={`mailto:${business.email}`} className="inline-flex min-h-11 items-center break-all text-lg font-semibold text-ink underline-offset-2 hover:underline">
                      {business.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className={iconChip} aria-hidden>
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Address</h3>
                    <address className="mt-1 text-lg not-italic leading-snug text-ink">
                      {business.address.street}
                      <br />
                      {business.address.city}, {business.address.region} {business.address.postalCode}
                    </address>
                    <a
                      href={mapsLinks.directions}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="directions"
                      className="mt-1 inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy-700 underline-offset-2 hover:underline"
                    >
                      <Navigation className="size-4" aria-hidden />
                      Get directions<span className="sr-only"> (opens in new tab)</span>
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className={iconChip} aria-hidden>
                    <Clock className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Hours</h3>
                    <dl className="mt-1 grid gap-1 text-ink">
                      {business.hoursSummary.map((h) => (
                        <div key={h.label} className="flex flex-wrap gap-x-3">
                          <dt className="font-semibold">{h.label}</dt>
                          <dd className="text-slate tabular">{h.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </li>
              </ul>
            </section>

            <section aria-labelledby="visit-heading" className="flex items-start gap-4 rounded-[var(--radius-md)] border border-line bg-surface p-6" data-reveal>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white text-navy-700 ring-1 ring-line" aria-hidden>
                <CalendarClock className="size-5" />
              </span>
              <div>
                <h2 id="visit-heading" className="text-lg font-bold text-ink">
                  Coming to see a specific vehicle?
                </h2>
                <p className="mt-1 leading-relaxed text-slate">
                  Book a test drive or visit ahead of time so we can have the vehicle ready and a team member available when you arrive.
                </p>
                <ButtonLink href="/schedule" variant="secondary" className="mt-4">
                  Book an appointment
                </ButtonLink>
              </div>
            </section>
          </div>

          <div id="message" className="self-start rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Send us a message</h2>
            <p className="mt-2 leading-relaxed text-slate">We&apos;ll reply by your preferred contact method during business hours.</p>
            <a href={`tel:${business.phone.e164}`} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-slate hover:text-ink">
              <Phone className="size-4 text-navy-700" aria-hidden />
              Prefer to talk? Call <span className="font-semibold text-navy-700 underline underline-offset-2">{business.phone.display}</span>
            </a>
            <div className="mt-5">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="surface" labelledBy="map-heading">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-center lg:gap-16">
          <div data-reveal>
            <p className="eyebrow mb-2">Find us</p>
            <h2 id="map-heading" className={h2}>
              Visit us in Live Oak
            </h2>
            <address className="mt-3 not-italic leading-relaxed text-slate">{fullAddress}</address>
            <p className="mt-3 leading-relaxed text-slate">
              Serving {business.serviceArea}. Load the interactive map, or open directions in your preferred maps app.
            </p>
          </div>
          <MapEmbed />
        </div>
      </Section>
    </>
  );
}
