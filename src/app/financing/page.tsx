import { Check, ExternalLink, Phone, ShieldCheck } from "lucide-react";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { TodoFlag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FinancingInquiryForm } from "@/components/forms/FinancingInquiryForm";

export const metadata = pageMetadata({
  title: "Car Financing in Live Oak, TX",
  description:
    "See how financing works at Auto Select in Live Oak, TX. Start a secure pre-qualification, learn what to have ready, or ask our team a question. First-time buyers and people rebuilding credit are welcome.",
  path: "/financing",
});

const steps = [
  {
    title: "Pre-qualify securely",
    body: `Complete a short application through ${business.financing.providerName}, our secure third-party provider. Your details go straight to them, not through this website.`,
  },
  {
    title: "Review your options",
    body: "A member of our team walks you through the options available to you, including how price, down payment, and loan term shape a monthly payment.",
  },
  {
    title: "Choose your vehicle",
    body: "Pick a vehicle that fits your budget from our inventory, or ask us to find one. If you have a trade-in, its value can go toward your purchase.",
  },
  {
    title: "Finalize and drive",
    body: "Once a lender approves the terms, we complete the paperwork together. Pick up your vehicle in Live Oak or ask us about delivery.",
  },
];

const haveReady = [
  "Your full name, current address, and how long you've lived there",
  "Employer, job title, time on the job, and monthly income",
  "Your Social Security number and date of birth, entered only on the secure application",
  "A valid driver's license",
  "The down payment you have in mind, if any",
  "Trade-in details, if you have one: year, make, model, mileage, and any loan payoff",
];

const external = <span className="sr-only"> (opens in new tab)</span>;
const h2 = "font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]";

export default function FinancingPage() {
  return (
    <>
      <PageHero
        eyebrow="Financing"
        title="Used-car financing, explained plainly"
        intro="Start with a secure pre-qualification, then talk through the numbers with a real person. Whether you're buying your first car or rebuilding your credit, you're welcome here."
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Financing", path: "/financing" }]} />}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={business.financing.applicationUrl} external size="lg">
            Start secure pre-qualification
            <ExternalLink className="size-4" aria-hidden />
            {external}
          </ButtonLink>
          <ButtonLink href="#questions" variant="outline-light" size="lg">
            Ask a question first
          </ButtonLink>
        </div>
      </PageHero>

      <Section labelledBy="how-heading">
        <SectionHeader id="how-heading" eyebrow="How it works" title="Four steps from application to keys" />
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
          {steps.map((s, i) => (
            <li key={s.title} className="border-t border-line pt-5">
              <span aria-hidden className="flex size-9 items-center justify-center rounded-[var(--radius-sm)] bg-navy-900 font-display text-base font-bold text-white tabular">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold leading-snug text-ink">{s.title}</h3>
              <p className="mt-1.5 leading-relaxed text-slate">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="surface" labelledBy="credit-heading">
        <SectionHeader
          id="credit-heading"
          eyebrow="Every credit story"
          title="Financing for where you are today"
          intro="Your credit history is one part of the picture, not the whole thing. We'll talk it through respectfully and explain what may be possible."
        />
        <div className="grid gap-5 md:grid-cols-2" data-reveal>
          <article className="rounded-[var(--radius-md)] border border-line bg-white p-6 sm:p-7">
            <h3 className="text-xl font-bold text-ink">Buying your first car</h3>
            <p className="mt-2 leading-relaxed text-slate">
              A short or limited credit history is common for first-time buyers. We&apos;ll explain how financing works, what lenders typically look at, and what can
              strengthen an application — such as a larger down payment, proof of steady income, or a co-buyer.
            </p>
          </article>
          <article className="rounded-[var(--radius-md)] border border-line bg-white p-6 sm:p-7">
            <h3 className="text-xl font-bold text-ink">Rebuilding your credit</h3>
            <p className="mt-2 leading-relaxed text-slate">
              Past credit challenges happen to a lot of people, and they don&apos;t define you. Tell us where things stand and we&apos;ll help you understand which
              options may be available. Approval always depends on lender requirements.
            </p>
          </article>
        </div>
      </Section>

      <Section id="apply" labelledBy="apply-heading">
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow mb-2">Apply</p>
            <h2 id="apply-heading" className={h2}>
              Start your secure pre-qualification
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-slate">
              Your application is handled by <strong className="font-semibold text-ink">{business.financing.providerName}</strong>, a secure third-party provider.
              It opens in a new tab, and the information you enter goes directly to them — never through this website or our contact forms.
            </p>
            <div className="mt-6">
              <ButtonLink href={business.financing.applicationUrl} external size="lg">
                Start secure pre-qualification
                <ExternalLink className="size-4" aria-hidden />
                {external}
              </ButtonLink>
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 text-sm text-slate">
              <ShieldCheck className="size-4 shrink-0 text-navy-700" aria-hidden />
              Have questions while you apply? Call{" "}
              <a href={`tel:${business.phone.e164}`} className="inline-flex min-h-11 items-center font-semibold text-navy-700 underline underline-offset-2">
                {business.phone.display}
              </a>
            </p>
            <aside aria-label="Staff note" className="mt-8 max-w-xl rounded-[var(--radius-sm)] border border-dashed border-line-strong bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Staff note</p>
              <div className="mt-2">
                <TodoFlag>Confirm whether pre-qualification uses a soft credit inquiry (no score impact) before saying so on this page</TodoFlag>
              </div>
            </aside>
          </div>

          <div className="rounded-[var(--radius-md)] border border-line bg-white p-6 shadow-[var(--shadow-card)] sm:p-7" data-reveal>
            <h3 className="text-xl font-bold text-ink">What to have ready</h3>
            <ul className="mt-4 grid gap-3">
              {haveReady.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate">
                  <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
              When you finalize, a lender may ask for documents such as recent pay stubs, proof of residence, or proof of insurance.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-[var(--radius-md)] border border-line-strong bg-surface p-5 sm:p-6" data-reveal>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">Financing disclosure</h3>
          <p className="mt-2 leading-relaxed text-slate">{business.financing.disclosure}</p>
        </div>
      </Section>

      <Section id="questions" tone="surface" labelledBy="questions-heading">
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow mb-2">Questions</p>
            <h2 id="questions-heading" className={h2}>
              Not ready to apply? Ask us anything.
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-slate">
              Wondering how much to put down, whether a co-buyer makes sense, or how a trade-in affects your payment? Send a question and a member of our team will
              follow up during business hours.
            </p>
            <p className="mt-3 max-w-xl leading-relaxed text-slate">
              This form is for questions only. To apply, please use the secure pre-qualification above.
            </p>
            <dl className="mt-6 grid gap-1 text-sm text-slate">
              {business.hoursSummary.map((h) => (
                <div key={h.label} className="flex gap-2">
                  <dt className="font-semibold text-ink">{h.label}:</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Send a financing question</h2>
            <a
              href={`tel:${business.phone.e164}`}
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm text-slate hover:text-ink"
            >
              <Phone className="size-4 text-navy-700" aria-hidden />
              Prefer to talk? Call <span className="font-semibold text-navy-700 underline underline-offset-2">{business.phone.display}</span>
            </a>
            <div className="mt-5">
              <FinancingInquiryForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
