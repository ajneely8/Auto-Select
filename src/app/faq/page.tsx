import { ChevronDown, Phone } from "lucide-react";
import { business } from "@/config/business";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { TodoFlag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqAll, faqGroups } from "@/content/faq";

export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about buying a used vehicle from Auto Select in Live Oak, TX: inventory, financing, trade-ins, test drives, delivery, service contracts, and visiting us.",
  path: "/faq",
});

const openHours = business.hoursSummary
  .filter((h) => h.value.toLowerCase() !== "closed")
  .map((h) => `${h.label}, ${h.value}`)
  .join("; ");

export default function FaqPage() {
  return (
    <>
      <PageHero
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "FAQ", path: "/faq" }]} />}
        eyebrow="FAQ"
        title="Frequently asked questions"
        intro="Straight answers about buying, financing, trading in, and getting your vehicle from Auto Select."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Jump links */}
          <nav aria-label="FAQ topics" className="lg:col-span-3">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow mb-3">Topics</p>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:border-l lg:border-line">
                {faqGroups.map((g) => (
                  <li key={g.id}>
                    <a
                      href={`#${g.id}`}
                      className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-line px-3 text-sm font-medium text-slate hover:border-ink hover:text-ink lg:-ml-px lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l-2 lg:border-transparent lg:px-4 lg:hover:border-ink"
                    >
                      {g.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Groups */}
          <div className="max-w-3xl lg:col-span-9">
            {faqGroups.map((g, gi) => (
              <section key={g.id} id={g.id} aria-labelledby={`${g.id}-heading`} className={gi > 0 ? "mt-12" : ""}>
                <h2 id={`${g.id}-heading`} className="text-2xl font-bold sm:text-[1.75rem]">
                  {g.title}
                </h2>
                <div className="mt-4 border-t border-line">
                  {g.items.map((item) => (
                    <details key={item.q} className="group border-b border-line">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[1.0625rem] font-semibold text-ink hover:text-navy-700 [&::-webkit-details-marker]:hidden">
                        <span>{item.q}</span>
                        <ChevronDown
                          className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-ink"
                          aria-hidden
                        />
                      </summary>
                      <div className="pb-5 pr-9">
                        <p className="text-[1rem] leading-relaxed text-slate">{item.a}</p>
                        {item.todo && (
                          <p className="mt-3">
                            <TodoFlag>{item.todo}</TodoFlag>
                          </p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="surface" labelledBy="faq-cta-heading">
        <div className="flex flex-col gap-6 rounded-[var(--radius-md)] border border-line bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between" data-reveal>
          <div className="max-w-xl">
            <h2 id="faq-cta-heading" className="text-2xl font-bold sm:text-3xl">
              Still have a question?
            </h2>
            <p className="mt-2 text-slate">
              Our team is happy to help. Call during business hours ({openHours}) or send us a message anytime.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="/contact" size="lg">
              Contact us
            </ButtonLink>
            <a
              href={telHref(business.phone.e164)}
              className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-sm)] border border-line-strong px-5 font-semibold text-ink hover:border-ink"
            >
              <Phone className="size-4" aria-hidden />
              {business.phone.display}
            </a>
          </div>
        </div>
      </Section>

      <JsonLd data={faqJsonLd(faqAll.map(({ q, a }) => ({ q, a })))} />
    </>
  );
}
