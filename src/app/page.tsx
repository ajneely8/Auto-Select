import Link from "next/link";
import {
  CarFront,
  BadgeDollarSign,
  Repeat,
  SearchCheck,
  CalendarDays,
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Wrench,
  CircleDot,
  PaintBucket,
  BatteryCharging,
  ArrowRight,
  Handshake,
  Quote,
  ClipboardCheck,
  KeyRound,
} from "lucide-react";
import { getFeaturedVehicles, getPublishedVehicles } from "@/lib/inventory/repository";
import { toSummary } from "@/lib/inventory/summary";
import { displayPrice, vehicleFullName } from "@/lib/format";
import { business, mapsLinks, fullAddress } from "@/config/business";
import { showDemo360 } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { VehicleCard } from "@/components/inventory/VehicleCard";
import { QuickSearch, type QuickSearchOptions } from "@/components/home/QuickSearch";
import { HeroShowcase, type HeroVehicle } from "@/components/home/HeroShowcase";
import { ThreeEasyStepsBanner } from "@/components/home/ThreeEasyStepsBanner";
import { TradeInForm } from "@/components/forms/TradeInForm";
import { ContactForm } from "@/components/forms/ContactForm";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { reviews } from "@/content/reviews";

export const metadata = pageMetadata({
  title: "Used Cars in Live Oak, TX | Auto Select — We Make Car Buying Simple",
  description:
    "Shop used cars, trucks, and SUVs at Auto Select in Live Oak, Texas. Get pre-qualified, value your trade, request home or office delivery, or let us find the right vehicle for you near San Antonio.",
  path: "/",
});

const actions = [
  { href: "/inventory", icon: CarFront, title: "Browse inventory", text: "See every vehicle we have available right now." },
  { href: "/financing", icon: BadgeDollarSign, title: "Get financed", text: "Pre-qualify through our secure application." },
  { href: "/trade-in", icon: Repeat, title: "Value your trade", text: "Send your vehicle's details for an estimate." },
  { href: "/find-a-vehicle", icon: SearchCheck, title: "Find my vehicle", text: "Tell us what you want — we'll search for it." },
  { href: "/schedule", icon: CalendarDays, title: "Book an appointment", text: "Test drives, visits, or a phone consultation." },
  { href: "/delivery", icon: Truck, title: "Arrange delivery", text: "Ask about delivery to your home or office." },
];

const reasons = [
  { title: "Personal vehicle-locating help", text: "Can't find the right car on our lot? Describe what you need and your budget, and we'll search for options that fit." },
  { title: "Financing options for different situations", text: "Apply once through our secure application and we'll work to find financing that fits. Approval depends on lender requirements." },
  { title: "Trade-in assistance", text: "We'll estimate your trade, handle the payoff with your lender, and apply the value to your next vehicle." },
  { title: "Home or office delivery", text: "Ask about having your vehicle delivered so you can finish your purchase where it's convenient for you." },
  { title: "Service-contract options", text: "Protection plans may be available for vehicles outside the manufacturer's warranty. We'll explain the options — never push them." },
  { title: "Local help before and after you buy", text: "We're a family-owned dealership in Live Oak. The same team that sells you the car is here for questions afterward." },
];

const steps = [
  { icon: CarFront, title: "Describe your vehicle", text: "Browse our inventory, or tell us exactly what you're looking for and we'll start searching." },
  { icon: ClipboardCheck, title: "Talk to one of our reps & relax", text: "We handle the financing, your trade-in, and the paperwork — you don't have to do a thing." },
  { icon: KeyRound, title: "Take delivery of your vehicle", text: "Pick it up in Live Oak, or ask about delivery to your home or office." },
];

export default async function HomePage() {
  const [featuredRaw, published] = await Promise.all([getFeaturedVehicles(6), getPublishedVehicles()]);
  const featured = featuredRaw.map((v) => {
    const s = toSummary(v);
    if (v.exterior360IsDemo && !showDemo360) s.has360 = false;
    return s;
  });

  // Hero flips through real inventory: the priciest featured vehicles with a photo lead, up to 5 slides.
  const heroVehicles: HeroVehicle[] = [...featuredRaw]
    .filter((v) => v.photos.length > 0)
    .sort((a, b) => (displayPrice(b) ?? 0) - (displayPrice(a) ?? 0))
    .slice(0, 5)
    .map((v) => ({ slug: v.slug, title: vehicleFullName(v), price: displayPrice(v), photo: v.photos[0] }));

  const unique = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x))].sort();
  const modelsByMake: Record<string, string[]> = {};
  for (const v of published) modelsByMake[v.make] = unique([...(modelsByMake[v.make] ?? []), v.model]);
  const maxPrice = Math.max(0, ...published.map((v) => displayPrice(v) ?? 0));
  const options: QuickSearchOptions = {
    conditions: unique(published.map((v) => v.condition)),
    makes: unique(published.map((v) => v.make)),
    modelsByMake,
    bodies: unique(published.map((v) => v.bodyStyle)),
    priceSteps: [7500, 10000, 12500, 15000, 20000, 30000, 40000, 50000, 75000].filter((p, i, arr) => p <= maxPrice || arr[i - 1] < maxPrice),
  };

  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-navy-950 text-white on-dark">
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(100deg,#061224_0%,#061224_42%,rgba(6,18,36,0.55)_70%,rgba(6,18,36,0.2)_100%)] lg:hidden" />
        <div className="container-page relative grid items-center gap-10 pb-28 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-36 lg:pt-20">
          <div>
            <p className="eyebrow !text-accent">Family-owned · Live Oak, Texas</p>
            <h1 id="hero-heading" className="mt-3 text-[2.75rem] font-bold leading-[1.02] sm:text-6xl lg:text-[4.25rem]">
              Car Buying Made Simple
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Browse vehicles, get pre-qualified for financing, and trade in your current car — all with one local team. Prefer we do the searching? Tell us
              what you need and we&apos;ll find it, then deliver it to your home or office if you&apos;d like.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/inventory" size="lg">
                Browse Inventory
              </ButtonLink>
              <ButtonLink href="/financing" size="lg" variant="light">
                Get Pre-Qualified
              </ButtonLink>
              <ButtonLink href="/find-a-vehicle" size="lg" variant="outline-light">
                Find My Vehicle
              </ButtonLink>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/70">
              <MapPin className="size-4" aria-hidden /> Serving Live Oak and the San Antonio area
            </p>
          </div>

          <HeroShowcase vehicles={heroVehicles} />
        </div>
      </section>

      {/* ───────────── Quick search (overlaps hero) ───────────── */}
      <div className="container-page relative z-10 -mt-20 lg:-mt-24">
        <QuickSearch options={options} total={published.length} />
      </div>

      {/* ───────────── Buying process (kept near the top — this is how car buying here works) ───────────── */}
      <ThreeEasyStepsBanner steps={steps} />

      {/* ───────────── What would you like to do? ───────────── */}
      <section aria-labelledby="actions-heading" className="container-page pt-12">
        <h2 id="actions-heading" className="sr-only">
          What would you like to do?
        </h2>
        <ul className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-md)] border border-line bg-line gap-px md:grid-cols-3 lg:grid-cols-6">
          {actions.map((a) => (
            <li key={a.href} className="bg-white">
              <Link href={a.href} className="group flex h-full flex-col gap-2 p-4 hover:bg-surface sm:p-5">
                <a.icon className="size-6 text-accent-text" aria-hidden />
                <span className="font-display text-lg font-bold leading-tight text-ink group-hover:underline underline-offset-2">{a.title}</span>
                <span className="text-sm leading-snug text-slate">{a.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────── Featured inventory ───────────── */}
      <Section labelledBy="featured-heading">
        <SectionHeader
          id="featured-heading"
          eyebrow="Featured inventory"
          title="Vehicles available now"
          intro="A few of the vehicles on our lot this week. Save favorites, compare up to three, or check availability in one click."
          action={
            <ButtonLink href="/inventory" variant="outline">
              View all {published.length} vehicles <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v) => (
            <li key={v.id} className="flex [&>article]:w-full" data-reveal>
              <VehicleCard v={v} />
            </li>
          ))}
        </ul>
      </Section>

      {/* ───────────── Why Auto Select ───────────── */}
      <Section tone="surface" labelledBy="why-heading">
        <SectionHeader id="why-heading" eyebrow="Why Auto Select" title="A dealership that works around you" intro="We combine an online inventory with the personal attention of a family-owned business." />
        <ul className="grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <li key={r.title} className="bg-white p-6" data-reveal>
              <span className="font-display text-sm font-bold text-accent-text tabular">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-xl font-bold">{r.title}</h3>
              <p className="mt-2 text-slate leading-relaxed">{r.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ───────────── Financing ───────────── */}
      <Section tone="navy" labelledBy="financing-heading" id="financing">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div data-reveal>
            <p className="eyebrow !text-accent">Financing</p>
            <h2 id="financing-heading" className="mt-2 text-3xl font-bold leading-tight sm:text-[2.5rem]">
              Know your options before you visit
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Whether you&apos;re buying your first car, rebuilding your credit, or simply want a competitive rate, we&apos;ll work with you respectfully and explain every
              number. Start with our secure pre-qualification — it takes a few minutes.
            </p>
            <ol className="mt-6 grid gap-3 text-white/85">
              {["Complete the secure pre-qualification form.", "We review your options with our lending partners.", "We walk you through the terms before you decide."].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-white/10 text-sm font-bold tabular">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[var(--radius-md)] border border-white/15 bg-white/[0.04] p-6 sm:p-8" data-reveal>
            <ShieldCheck className="size-8 text-white" aria-hidden />
            <h3 className="mt-3 font-display text-2xl font-bold">Secure pre-qualification</h3>
            <p className="mt-2 text-white/75">Handled by {business.financing.providerName}, our secure third-party application provider. Your information goes directly to them, not through this website.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={business.financing.applicationUrl} external size="lg" variant="light">
                Get Pre-Qualified<span className="sr-only"> (opens in new tab)</span>
              </ButtonLink>
              <ButtonLink href="/financing" size="lg" variant="outline-light">
                How financing works
              </ButtonLink>
            </div>
            <p className="mt-6 border-t border-white/15 pt-4 text-xs leading-relaxed text-white/65">{business.financing.disclosure}</p>
          </div>
        </div>
      </Section>

      {/* ───────────── Trade-in ───────────── */}
      <Section labelledBy="trade-heading" id="trade-in">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div data-reveal>
            <p className="eyebrow">Trade-in</p>
            <h2 id="trade-heading" className="mt-2 text-3xl font-bold leading-tight sm:text-[2.5rem]">
              What&apos;s your current vehicle worth?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate">Send us the details and a few photos. We&apos;ll follow up with a preliminary estimate you can apply toward your next vehicle.</p>
            <ul className="mt-6 grid gap-3 text-slate">
              {["Estimates are free, with no obligation to buy.", "Still making payments? We can handle the payoff with your lender.", "Photos help us give a more accurate estimate."].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Handshake className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-[var(--radius-sm)] border-l-4 border-navy-900 bg-surface p-4 text-sm text-slate">
              Online estimates are preliminary. The final offer is confirmed after a physical inspection of the vehicle and its title.
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-7">
            <TradeInForm compact />
          </div>
        </div>
      </Section>

      {/* ───────────── Vehicle locator ───────────── */}
      <Section tone="ink" labelledBy="locator-heading">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div data-reveal>
            <p className="eyebrow !text-accent">Vehicle locator</p>
            <h2 id="locator-heading" className="mt-2 text-3xl font-bold leading-tight sm:text-[2.5rem]">
              Don&apos;t see the right vehicle? We&apos;ll find it.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Tell us the make, model, trim, colors, mileage, budget, and features that matter to you. We&apos;ll search for vehicles that match and bring you options to review
              — no pressure to buy.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/find-a-vehicle" size="lg">
                Find My Vehicle
              </ButtonLink>
              <a href={`tel:${business.phone.e164}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-white/40 px-6 font-semibold text-white hover:border-white">
                <Phone className="size-4" aria-hidden /> Or call {business.phone.display}
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-white/10 bg-white/10" data-reveal>
            {[
              ["The vehicle", "Make, model, trim, year range, body style"],
              ["The details", "Colors, maximum mileage, must-have features"],
              ["Your budget", "Total budget or an estimated monthly range"],
              ["Your timing", "When you'd like to buy, and whether you have a trade"],
            ].map(([t, d]) => (
              <div key={t} className="bg-charcoal p-5">
                <dt className="font-display text-lg font-bold text-white">{t}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/70">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ───────────── Delivery ───────────── */}
      <Section labelledBy="delivery-heading">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div data-reveal>
            <p className="eyebrow">Delivery</p>
            <h2 id="delivery-heading" className="mt-2 text-3xl font-bold leading-tight sm:text-[2.5rem]">
              Finish your purchase at home or at the office
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate">
              Busy schedule? Ask about delivery. We&apos;ll prepare the paperwork ahead of time, bring the vehicle to you, and walk you through it before you sign.
            </p>
            <p className="mt-4 text-sm font-medium text-ink">Availability, eligibility, timing, distance, and fees must be confirmed by Auto Select.</p>
            <ButtonLink href="/delivery" variant="secondary" size="lg" className="mt-7">
              <Truck className="size-4" aria-hidden /> Request Delivery
            </ButtonLink>
          </div>
          <ol className="grid gap-4" data-reveal>
            {["Choose your vehicle and complete financing.", "Tell us where and when you'd like it delivered.", "We confirm eligibility, timing, and any fees.", "Inspect the vehicle, sign, and keep the keys."].map((t, i) => (
              <li key={t} className="flex items-center gap-4 rounded-[var(--radius-md)] border border-line p-4">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-surface font-display font-bold text-navy-900">{i + 1}</span>
                <span className="text-slate">{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ───────────── Service contracts vs. automotive services ───────────── */}
      <Section tone="surface" labelledBy="protect-heading">
        <SectionHeader id="protect-heading" eyebrow="Protection & services" title="Support after you drive away" intro="Two different things, clearly separated: optional protection plans, and hands-on automotive services." />
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="flex flex-col rounded-[var(--radius-md)] border border-line bg-white p-6 sm:p-8" data-reveal>
            <ShieldCheck className="size-7 text-navy-700" aria-hidden />
            <h3 className="mt-3 font-display text-2xl font-bold">Vehicle service contracts</h3>
            <p className="mt-2 text-slate leading-relaxed">
              Extended service protection may be available for vehicles outside the manufacturer&apos;s warranty. Coverage, terms, and cost vary by plan — request a quote and
              we&apos;ll explain the details so you can decide.
            </p>
            <ButtonLink href="/service-contracts" variant="outline" className="mt-auto self-start">
              Request a Quote
            </ButtonLink>
          </article>
          <article className="flex flex-col rounded-[var(--radius-md)] border border-line bg-white p-6 sm:p-8" data-reveal>
            <Wrench className="size-7 text-navy-700" aria-hidden />
            <h3 className="mt-3 font-display text-2xl font-bold">Automotive services</h3>
            <ul className="mt-3 grid gap-2.5 text-slate sm:grid-cols-2">
              {[
                { icon: Wrench, t: "Mobile mechanic assistance" },
                { icon: CircleDot, t: "Tires & wheel balancing" },
                { icon: PaintBucket, t: "Body repair & painting" },
                { icon: Truck, t: "Towing" },
                { icon: BatteryCharging, t: "Jump starts" },
              ].map(({ icon: Icon, t }) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Icon className="size-4 shrink-0 text-muted" aria-hidden /> {t}
                </li>
              ))}
            </ul>
            <ButtonLink href="/services" variant="outline" className="mt-6 self-start">
              Request Service
            </ButtonLink>
          </article>
        </div>
      </Section>

      {/* ───────────── Reviews ───────────── */}
      <Section labelledBy="reviews-heading">
        <SectionHeader
          id="reviews-heading"
          eyebrow="Customer comments"
          title="What our customers say"
          action={
            <Link href="/reviews" className="text-sm font-semibold text-navy-700 underline-offset-2 hover:underline">
              Read all reviews
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((r) => (
            <figure key={r.id} className="flex flex-col rounded-[var(--radius-md)] border border-line bg-white p-6 sm:p-8" data-reveal>
              <Quote className="size-7 text-accent-text" aria-hidden />
              <blockquote className="mt-3 flex-1 text-lg leading-relaxed text-ink">&ldquo;{r.body}&rdquo;</blockquote>
              <figcaption className="mt-5 border-t border-line pt-4 font-semibold text-ink">{r.author}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* ───────────── Contact & location ───────────── */}
      <Section tone="surface" labelledBy="contact-heading" id="contact">
        <SectionHeader id="contact-heading" eyebrow="Visit or contact us" title="We're in Live Oak, just northeast of San Antonio" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid content-start gap-6">
            <ul className="grid gap-4 rounded-[var(--radius-md)] border border-line bg-white p-6">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">Address</p>
                  <address className="not-italic text-slate">{fullAddress}</address>
                  <a href={mapsLinks.directions} target="_blank" rel="noopener noreferrer" data-track="directions" className="mt-1 inline-block text-sm font-semibold text-navy-700 underline underline-offset-2">
                    Get directions<span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">Phone</p>
                  <a href={`tel:${business.phone.e164}`} className="text-slate underline-offset-2 hover:underline">
                    {business.phone.display}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">Email</p>
                  <a href={`mailto:${business.email}`} className="text-slate underline-offset-2 hover:underline">
                    {business.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">Hours</p>
                  {business.hoursSummary.map((h) => (
                    <p key={h.label} className="text-slate">
                      {h.label}: {h.value}
                    </p>
                  ))}
                </div>
              </li>
            </ul>
            <MapEmbed />
            <ButtonLink href="/schedule" size="lg" className="w-full sm:w-auto">
              <CalendarDays className="size-4" aria-hidden /> Book an Appointment
            </ButtonLink>
          </div>
          <div className="rounded-[var(--radius-md)] border border-line bg-white p-5 sm:p-7">
            <h3 className="mb-5 font-display text-2xl font-bold">Send us a message</h3>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
