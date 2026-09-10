import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { business, fullAddress } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { PageHero, Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { TodoFlag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { team, spanishSpeakers, hasOpenPosition } from "@/content/team";
import { TeamPhoto } from "@/components/about/TeamPhoto";
import { UserPlus } from "lucide-react";
import { reviews } from "@/content/reviews";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Auto Select is a family-owned online used-car dealership in Live Oak, Texas. Meet the team and see how we help San Antonio-area drivers with inventory, vehicle locating, financing, trade-ins, and delivery.",
  path: "/about",
});

const buyingServices = [
  { name: "Vehicle inventory", text: "Browse our current used vehicles online, with photos and details for each one.", href: "/inventory" },
  { name: "Vehicle locating & car-buying assistance", text: "Tell us what you're looking for, and we'll search for vehicles that match.", href: "/find-a-vehicle" },
  { name: "Financing applications", text: `Apply through a secure third-party application from ${business.financing.providerName}.`, href: "/financing" },
  { name: "Trade-in evaluations", text: "Start with a preliminary estimate online, finalized with an in-person inspection.", href: "/trade-in" },
  { name: "Vehicle delivery", text: "Ask about delivery to your home or office. Availability and any fees are confirmed for each purchase.", href: "/delivery" },
  { name: "Extended service contracts", text: "Optional coverage for certain repairs — never required to buy a vehicle.", href: "/service-contracts" },
];

const automotiveServices = ["Certified mobile mechanic", "Tires & wheel balancing", "Body repair & painting", "Towing", "Jump starts"];

export default function AboutPage() {
  const featured = reviews.find((r) => r.id === "karen-herzing") ?? reviews[0];

  return (
    <>
      <PageHero
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "About", path: "/about" }]} />}
        eyebrow="About Auto Select"
        title="A family-owned dealership built to make car buying simple"
        intro={`Auto Select is an online used-car dealership in Live Oak, Texas, serving ${business.serviceArea}.`}
      />

      {/* Team */}
      <Section labelledBy="team-heading">
        <SectionHeader
          id="team-heading"
          eyebrow="Our team"
          title="The people you'll work with"
          intro="Experienced in sales, finance, titles, and trade appraisals — and focused on keeping your purchase simple."
        />
        <div className="mb-6">
          <TodoFlag>Confirm this roster, titles, and photos are still current</TodoFlag>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((m) => (
            <li key={m.id} data-reveal className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-white">
              <TeamPhoto photo={m.photo} initials={m.initials} />
              <div className="p-5">
                <h3 className="text-lg font-bold leading-tight">{m.name}</h3>
                <p className="mt-0.5 text-sm font-semibold text-accent-text">{m.title}</p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate">{m.bio}</p>
                {m.needsConfirmation.map((note) => (
                  <p key={note} className="mt-3">
                    <TodoFlag>{note}</TodoFlag>
                  </p>
                ))}
              </div>
            </li>
          ))}
          {hasOpenPosition && (
            <li data-reveal className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-line-strong bg-surface p-5 text-center sm:aspect-auto">
              <UserPlus className="size-7 text-muted" aria-hidden />
              <h3 className="text-base font-bold">Join our team</h3>
              <p className="text-sm text-slate">We&apos;re growing — reach out if you&apos;d like to work with us.</p>
              <a href={`mailto:${business.email}`} className="mt-1 text-sm font-semibold text-accent-text underline underline-offset-2">
                {business.email}
              </a>
            </li>
          )}
        </ul>
        {spanishSpeakers.length > 0 && (
          <p className="mt-6 text-sm text-slate">
            <TodoFlag>Confirm Spanish-language assistance before advertising it</TodoFlag> — listed as fluent in Spanish: {spanishSpeakers.map((m) => m.name).join(", ")}.
          </p>
        )}
      </Section>

      {/* Story */}
      <Section tone="surface" labelledBy="story-heading">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <p className="eyebrow mb-2">Our story</p>
            <h2 id="story-heading" className="text-3xl sm:text-[2.5rem] font-bold leading-[1.08]">
              One team for the whole purchase
            </h2>
            <div className="prose-page mt-6 max-w-3xl">
              <p>
                Auto Select is a family-owned dealership led by owner Patrick Simon, who brings more than 22 years of experience as a General Sales Manager for new and
                used vehicles at Toyota and Volvo dealerships.
              </p>
              <p>
                Our approach is straightforward: we bring together the parts of buying a car that are usually spread across several places — finding the right
                vehicle, evaluating your trade-in, submitting your financing application, and completing the paperwork — so you work with one team from start to
                finish.
              </p>
              <p>
                Whether you&apos;re shopping our current inventory or need help finding something specific, we&apos;ll explain the numbers, answer your questions,
                and keep the process moving at a pace that works for you.
              </p>
            </div>
            <div className="mt-6">
              <TodoFlag>Add founding year and story details</TodoFlag>
            </div>
          </div>

          <aside className="lg:col-span-5" aria-labelledby="glance-heading" data-reveal>
            <div className="rounded-[var(--radius-md)] border border-line bg-surface p-6">
              <h2 id="glance-heading" className="text-xl font-bold">
                At a glance
              </h2>
              <dl className="mt-4 divide-y divide-line text-[0.9375rem]">
                <div className="grid gap-1 py-3 sm:grid-cols-[7.5rem_1fr]">
                  <dt className="font-semibold text-ink">Location</dt>
                  <dd className="text-slate">{fullAddress}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[7.5rem_1fr]">
                  <dt className="font-semibold text-ink">Hours</dt>
                  <dd className="text-slate">
                    <ul>
                      {business.hoursSummary.map((h) => (
                        <li key={h.label}>
                          {h.label}: {h.value}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[7.5rem_1fr]">
                  <dt className="font-semibold text-ink">Phone</dt>
                  <dd>
                    <a href={telHref(business.phone.e164)} className="inline-flex min-h-11 items-center font-semibold text-navy-700 underline-offset-2 hover:underline">
                      {business.phone.display}
                    </a>
                  </dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[7.5rem_1fr]">
                  <dt className="font-semibold text-ink">Serving</dt>
                  <dd className="text-slate">{business.serviceArea}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </Section>

      {/* How we help */}
      <Section labelledBy="help-heading">
        <SectionHeader
          id="help-heading"
          eyebrow="How we help"
          title="Everything you need to buy — and keep driving"
          intro="From choosing a vehicle to keeping it on the road, here's what Auto Select handles."
        />
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8" data-reveal>
            <h3 className="text-lg font-bold">Buying a vehicle</h3>
            <ul className="mt-3 divide-y divide-line border-y border-line bg-white">
              {buyingServices.map((s) => (
                <li key={s.name}>
                  <Link
                    href={s.href}
                    className="group flex min-h-11 items-start justify-between gap-4 px-4 py-4 transition-colors hover:bg-surface sm:px-5"
                  >
                    <span>
                      <span className="block font-semibold text-ink group-hover:underline underline-offset-2">{s.name}</span>
                      <span className="mt-0.5 block text-[0.9375rem] text-slate">{s.text}</span>
                    </span>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-4" data-reveal>
            <h3 className="text-lg font-bold">Automotive services</h3>
            <ul className="mt-3 divide-y divide-line border-y border-line bg-white">
              {automotiveServices.map((s) => (
                <li key={s} className="px-4 py-3 font-medium text-ink sm:px-5">
                  {s}
                </li>
              ))}
            </ul>
            <Link href="/services" className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy-700 underline-offset-2 hover:underline">
              See automotive services <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>

      {/* Customer voice */}
      {featured && (
        <Section tone="surface" labelledBy="voice-heading">
          <div className="mx-auto max-w-3xl text-center" data-reveal>
            <h2 id="voice-heading" className="sr-only">
              What a customer said
            </h2>
            <figure>
              <blockquote className="font-display text-2xl font-semibold leading-snug text-ink sm:text-[1.75rem]">
                <p>&ldquo;{featured.body}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-4 text-[0.9375rem] font-semibold text-slate">— {featured.author}</figcaption>
            </figure>
            <Link href="/reviews" className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-semibold text-navy-700 underline-offset-2 hover:underline">
              Read customer reviews <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section tone="navy" labelledBy="about-cta-heading">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" data-reveal>
          <div className="max-w-2xl">
            <h2 id="about-cta-heading" className="text-3xl font-bold leading-tight">
              Ready to find your next vehicle?
            </h2>
            <p className="mt-2 text-lg text-white/80">Browse our inventory, or tell us what you&apos;re looking for and we&apos;ll help from there.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/inventory" size="lg">
              Browse inventory
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline-light" size="lg">
              Contact us
            </ButtonLink>
            <a href={telHref(business.phone.e164)} className="inline-flex min-h-12 items-center gap-2 px-2 font-semibold text-white underline-offset-2 hover:underline">
              <Phone className="size-4" aria-hidden />
              {business.phone.display}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
