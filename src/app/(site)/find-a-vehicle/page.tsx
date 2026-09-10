import { Check, Phone } from "lucide-react";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { TodoFlag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { VehicleLocatorForm } from "@/components/forms/VehicleLocatorForm";

export const metadata = pageMetadata({
  title: "Vehicle Locating Service",
  description:
    "Can't find the right car in our inventory? Tell Auto Select the make, model, features, and budget you want, and our Live Oak team will search and follow up with options.",
  path: "/find-a-vehicle",
});

const steps = [
  {
    title: "Describe the vehicle",
    body: "Share the make, model, body style, features, and budget that matter to you. Be as specific or as flexible as you like.",
  },
  {
    title: "We search",
    body: "Our team looks for vehicles that fit your criteria and reviews the details that matter — mileage, condition, equipment, and price.",
  },
  {
    title: "You review the options",
    body: "We follow up by your preferred contact method with what we find. You decide whether any of them are worth a closer look.",
  },
  {
    title: "Buy and take delivery",
    body: "When you find the right one, we help with financing, your trade-in, and the paperwork. Pick it up in Live Oak or ask about delivery.",
  },
];

const goodFit = [
  "You have a specific model, trim, or color in mind",
  "You need particular features, like third-row seating, four-wheel drive, or a towing package",
  "You're shopping within a firm budget or monthly payment target",
  "You'd rather not spend weekends visiting lots and scrolling through listings",
];

const h2 = "font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]";

export default function FindAVehiclePage() {
  return (
    <>
      <PageHero
        eyebrow="Vehicle locating"
        title="Tell us what you want. We'll look for it."
        intro="If the right vehicle isn't in our inventory today, describe what you're after and our team will search for options that fit your needs and budget."
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Find a Vehicle", path: "/find-a-vehicle" }]} />}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#request" size="lg">
            Start your request
          </ButtonLink>
          <ButtonLink href="/inventory" variant="outline-light" size="lg">
            Browse current inventory
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
          <div className="grid content-start gap-12">
            <section aria-labelledby="how-heading" data-reveal>
              <p className="eyebrow mb-2">How it works</p>
              <h2 id="how-heading" className={h2}>
                From your wish list to your driveway
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

            <section aria-labelledby="fit-heading" data-reveal>
              <h2 id="fit-heading" className={h2}>
                Who it&apos;s for
              </h2>
              <p className="mt-3 leading-relaxed text-slate">Our locating service is a good fit when:</p>
              <ul className="mt-4 grid gap-2.5">
                {goodFit.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate">
                    <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="know-heading" className="rounded-[var(--radius-md)] border border-line bg-surface p-6" data-reveal>
              <h2 id="know-heading" className="text-xl font-bold text-ink">
                Good to know
              </h2>
              <p className="mt-2 leading-relaxed text-slate">
                What we can find depends on what&apos;s on the market during your search. Flexible criteria — a range of years, a few acceptable colors, more than one
                trim — usually means more options to choose from.
              </p>
            </section>

            <aside aria-label="Staff note" className="rounded-[var(--radius-sm)] border border-dashed border-line-strong bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Staff note</p>
              <div className="mt-2">
                <TodoFlag>Confirm whether the locating service involves any fee or deposit, and where located vehicles are sourced, before publishing</TodoFlag>
              </div>
            </aside>
          </div>

          <div id="request" className="self-start rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Start your vehicle request</h2>
            <p className="mt-2 leading-relaxed text-slate">Along with your contact info, we just need a make, a body style, or your must-have features. Everything else is optional.</p>
            <a href={`tel:${business.phone.e164}`} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-slate hover:text-ink">
              <Phone className="size-4 text-navy-700" aria-hidden />
              Prefer to talk? Call <span className="font-semibold text-navy-700 underline underline-offset-2">{business.phone.display}</span>
            </a>
            <div className="mt-5">
              <VehicleLocatorForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
