import Link from "next/link";
import { ArrowRight, Check, Phone, Wrench } from "lucide-react";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { TodoFlag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ServiceContractQuoteForm } from "@/components/forms/ServiceContractQuoteForm";

export const metadata = pageMetadata({
  title: "Vehicle Service Contracts",
  description:
    "Learn what a vehicle service contract is, what it may cover, and whether one fits your situation. Request a quote from Auto Select in Live Oak, TX.",
  path: "/service-contracts",
});

const mayCover = [
  "Engine and transmission (powertrain) components",
  "Drive axles and transfer case",
  "Air conditioning and heating",
  "Electrical systems and components",
  "Steering, suspension, and non-wear brake parts",
  "Fuel and cooling systems",
  "Extras on some plans, such as roadside assistance or rental car coverage",
];

const mayFit = [
  "You plan to keep your vehicle after its factory warranty ends",
  "You drive a lot of miles for work or commuting",
  "You'd rather budget for protection than face a large, unexpected repair bill",
  "Your vehicle has complex electronics or systems that can be costly to repair",
];

const askBefore = [
  "What's the deductible, and is it charged per visit or per repair?",
  "Where can repairs be done, and how are claims paid?",
  "When does coverage begin, and when does it end — by time or by mileage?",
  "What maintenance do I need to keep up to stay covered?",
  "Can I cancel, and is any part of the price refundable?",
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

export default function ServiceContractsPage() {
  return (
    <>
      <PageHero
        eyebrow="Service contracts"
        title="Repair protection for after the factory warranty"
        intro="Extended service protection may be available for vehicles outside the manufacturer's warranty. Request a quote for details."
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Service Contracts", path: "/service-contracts" }]} />}
        facebookVideoUrl="https://www.facebook.com/watch/?v=7864626206974262"
      >
        <ButtonLink href="#quote" size="lg">
          Request a quote
        </ButtonLink>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
          <div className="grid content-start gap-12">
            <section aria-labelledby="what-heading" data-reveal>
              <p className="eyebrow mb-2">The basics</p>
              <h2 id="what-heading" className={h2}>
                What is a vehicle service contract?
              </h2>
              <div className="mt-3 grid gap-3 leading-relaxed text-slate">
                <p>
                  A vehicle service contract — often called an extended warranty — is an optional plan that helps pay for certain repairs after the
                  manufacturer&apos;s warranty ends. You choose a plan, and if a covered part fails, the plan pays for the repair according to its terms, sometimes
                  after a deductible.
                </p>
                <p>It&apos;s a way to trade an unpredictable repair bill for a known cost. Whether that trade makes sense depends on your vehicle and how you drive.</p>
              </div>
            </section>

            <section aria-labelledby="cover-heading" data-reveal>
              <h2 id="cover-heading" className={h2}>
                What a plan may cover
              </h2>
              <p className="mt-3 leading-relaxed text-slate">
                Coverage varies by plan and provider. The specific terms, exclusions, and limits are set out in the contract itself. Depending on the plan, coverage
                may include:
              </p>
              <div className="mt-4">
                <CheckList items={mayCover} />
              </div>
              <p className="mt-4 leading-relaxed text-slate">
                Routine maintenance and normal wear items — such as oil changes, brake pads, wiper blades, and tires — are typically not covered. Always read the
                contract before you buy.
              </p>
            </section>

            <section aria-labelledby="fit-heading" data-reveal>
              <h2 id="fit-heading" className={h2}>
                Who it may suit
              </h2>
              <p className="mt-3 leading-relaxed text-slate">A service contract may be worth considering if:</p>
              <div className="mt-4">
                <CheckList items={mayFit} />
              </div>
            </section>

            <section aria-labelledby="ask-heading" className="rounded-[var(--radius-md)] border border-line p-6" data-reveal>
              <h2 id="ask-heading" className="text-xl font-bold text-ink">
                Questions to ask before you buy
              </h2>
              <ul className="mt-4 grid list-disc gap-2 pl-5 leading-relaxed text-slate marker:text-navy-700">
                {askBefore.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </section>

            <aside aria-labelledby="not-service-heading" className="flex items-start gap-4 rounded-[var(--radius-md)] border border-line bg-surface p-6" data-reveal>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white text-navy-700 ring-1 ring-line" aria-hidden>
                <Wrench className="size-5" />
              </span>
              <div>
                <h2 id="not-service-heading" className="text-lg font-bold text-ink">
                  Need a repair now?
                </h2>
                <p className="mt-1 leading-relaxed text-slate">
                  Service contracts are separate from our automotive services. For hands-on help — a mobile mechanic, tires, body work, towing, or a jump start — visit
                  our services page.
                </p>
                <Link href="/services" className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy-700 underline-offset-2 hover:underline">
                  See automotive services <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </aside>

            <aside aria-label="Staff note" className="rounded-[var(--radius-sm)] border border-dashed border-line-strong bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Staff note</p>
              <div className="mt-2">
                <TodoFlag>Confirm provider name, plan details, and any transferability or financing terms before publishing</TodoFlag>
              </div>
            </aside>
          </div>

          <div id="quote" className="self-start rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Request a service contract quote</h2>
            <p className="mt-2 leading-relaxed text-slate">
              Your VIN and current mileage let us check which plans may be available for your vehicle. We&apos;ll follow up with the details.
            </p>
            <a href={`tel:${business.phone.e164}`} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-slate hover:text-ink">
              <Phone className="size-4 text-navy-700" aria-hidden />
              Prefer to talk? Call <span className="font-semibold text-navy-700 underline underline-offset-2">{business.phone.display}</span>
            </a>
            <div className="mt-5">
              <ServiceContractQuoteForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
