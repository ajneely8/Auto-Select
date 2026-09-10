import { Check, Phone } from "lucide-react";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { TradeInForm } from "@/components/forms/TradeInForm";

export const metadata = pageMetadata({
  title: "Value Your Trade-In",
  description:
    "Get a preliminary trade-in estimate from Auto Select in Live Oak, TX. Share your vehicle's details and photos online; the final value is confirmed after an in-person inspection.",
  path: "/trade-in",
});

const steps = [
  {
    title: "Share the details",
    body: "Enter the year, make, model, mileage, and condition. A VIN or plate number and a few photos help us be more accurate.",
  },
  {
    title: "Get a preliminary estimate",
    body: "A member of our team reviews your information and follows up with a preliminary estimate by your preferred contact method.",
  },
  {
    title: "Inspection confirms the value",
    body: "We look the vehicle over in person. The final offer reflects what we find, so an honest description up front means fewer surprises.",
  },
  {
    title: "Put it toward your next vehicle",
    body: "Your trade-in value can be applied to the vehicle you choose, which can lower the amount you need to pay or finance.",
  },
];

const valueFactors = [
  "Year, mileage, and overall condition",
  "Trim level, options, and equipment",
  "Mechanical condition and any warning lights",
  "Accident, damage, and repair history",
  "Tire and brake wear",
  "Current market demand for that make and model",
  "Service records and spare keys, when you have them",
];

const bring = [
  "The title, or your lender's name and account details if there's a loan",
  "Current registration",
  "All keys and remotes",
  "A valid driver's license",
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

export default function TradeInPage() {
  return (
    <>
      <PageHero
        eyebrow="Trade-in"
        title="Find out what your current vehicle is worth"
        intro="Tell us about your vehicle and add a few photos. We'll follow up with a preliminary estimate you can put toward your next car."
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Trade-In", path: "/trade-in" }]} />}
      >
        <ButtonLink href="#estimate" size="lg">
          Start your estimate
        </ButtonLink>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
          <div className="grid content-start gap-12">
            <section aria-labelledby="how-heading" data-reveal>
              <p className="eyebrow mb-2">How it works</p>
              <h2 id="how-heading" className={h2}>
                How trade-in estimates work
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
              <p className="mt-6 rounded-[var(--radius-sm)] border border-line bg-surface p-4 text-sm leading-relaxed text-slate">
                <strong className="font-semibold text-ink">Good to know:</strong> Online estimates are preliminary and subject to a physical inspection.
              </p>
            </section>

            <section aria-labelledby="payoff-heading" data-reveal>
              <h2 id="payoff-heading" className={h2}>
                Still making payments?
              </h2>
              <div className="mt-3 grid gap-3 leading-relaxed text-slate">
                <p>
                  That&apos;s common, and it doesn&apos;t rule out a trade-in. Include an approximate payoff amount in the form — an estimate is fine — and have your
                  lender&apos;s name handy.
                </p>
                <p>
                  If your vehicle is worth more than you owe, the difference can go toward your next purchase. If you owe more than it&apos;s worth, we&apos;ll show you
                  exactly how that affects the numbers before you decide anything.
                </p>
              </div>
            </section>

            <section aria-labelledby="value-heading" data-reveal>
              <h2 id="value-heading" className={h2}>
                What affects your trade-in value
              </h2>
              <p className="mt-3 leading-relaxed text-slate">Every vehicle is different. These are the main things we consider:</p>
              <div className="mt-4">
                <CheckList items={valueFactors} />
              </div>
            </section>

            <section aria-labelledby="bring-heading" className="rounded-[var(--radius-md)] border border-line p-6" data-reveal>
              <h2 id="bring-heading" className="text-xl font-bold text-ink">
                What to bring to the inspection
              </h2>
              <div className="mt-4">
                <CheckList items={bring} />
              </div>
            </section>
          </div>

          <div id="estimate" className="self-start rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Get your preliminary estimate</h2>
            <p className="mt-2 leading-relaxed text-slate">It only takes a few details. Photos are optional but helpful.</p>
            <a href={`tel:${business.phone.e164}`} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-slate hover:text-ink">
              <Phone className="size-4 text-navy-700" aria-hidden />
              Prefer to talk? Call <span className="font-semibold text-navy-700 underline underline-offset-2">{business.phone.display}</span>
            </a>
            <div className="mt-5">
              <TradeInForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
