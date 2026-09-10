import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BatteryCharging, CircleDot, Info, PaintBucket, Phone, Truck, Wrench } from "lucide-react";
import { business } from "@/config/business";
import { pageMetadata } from "@/lib/seo";
import { PageHero, Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { TodoFlag } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ServiceRequestForm, type ServiceId } from "@/components/forms/ServiceRequestForm";

export const metadata = pageMetadata({
  title: "Automotive Services",
  description:
    "Mobile mechanic assistance, tires and wheel balancing, body repair and painting, towing, and jump starts from Auto Select in Live Oak, TX. Send a service request and our team will follow up.",
  path: "/services",
});

// Kept here (not imported from the client form module) so this server component can read the values.
const SERVICE_IDS: ServiceId[] = ["mobile-mechanic", "tires-balancing", "body-paint", "towing", "jump-start", "other"];

const services: { id: ServiceId; title: string; icon: LucideIcon; body: string }[] = [
  {
    id: "mobile-mechanic",
    title: "Certified mobile mechanic assistance",
    icon: Wrench,
    body: "Diagnostics and many common repairs handled where your vehicle is — at home, at work, or in a parking lot — so you don't have to arrange a trip to the shop.",
  },
  {
    id: "tires-balancing",
    title: "Tires & wheel balancing",
    icon: CircleDot,
    body: "Tire replacement and wheel balancing to address vibration, uneven wear, and handling problems. If you know your tire size, it's printed on the sidewall.",
  },
  {
    id: "body-paint",
    title: "Body repair & painting",
    icon: PaintBucket,
    body: "Repair for dents, scrapes, and collision damage, with paint work to restore your vehicle's finish. Describe the damage and we'll follow up to take a closer look.",
  },
  {
    id: "towing",
    title: "Towing",
    icon: Truck,
    body: "Transport for a vehicle that won't start or isn't safe to drive. Tell us where the vehicle is now and where it needs to go.",
  },
  {
    id: "jump-start",
    title: "Jump starts",
    icon: BatteryCharging,
    body: "Help getting a vehicle with a dead battery running again. If the battery keeps failing, we can talk through whether it needs to be replaced.",
  },
];

const steps = [
  { title: "Send a request", body: "Tell us what you need, the vehicle, and where it is. The more detail you share, the better we can prepare." },
  { title: "We follow up", body: "A team member contacts you to confirm availability, timing, and pricing. Nothing is scheduled until we confirm it with you." },
  { title: "Get back on the road", body: "Once everything is agreed, the work gets done and we'll let you know if anything else comes up along the way." },
];

const h2 = "font-display text-2xl font-bold leading-tight text-ink sm:text-[1.75rem]";

export default async function ServicesPage({ searchParams }: PageProps<"/services">) {
  const sp = await searchParams;
  const requested = typeof sp.service === "string" ? sp.service : undefined;
  const defaultService = SERVICE_IDS.find((id) => id === requested);

  return (
    <>
      <PageHero
        eyebrow="Automotive services"
        title="Help for the vehicle you already drive"
        intro="From a flat tire to a fender repair, send us a service request and our team will follow up to confirm availability and timing."
        breadcrumbs={<Breadcrumbs tone="dark" items={[{ name: "Services", path: "/services" }]} />}
      >
        <ButtonLink href="#request" size="lg">
          Request Service
        </ButtonLink>
      </PageHero>

      <Section labelledBy="services-heading">
        <SectionHeader
          id="services-heading"
          eyebrow="What we offer"
          title="Automotive services"
          intro={
            <>
              Hands-on help with repairs, tires, body work, and roadside problems. Looking for repair protection instead? See{" "}
              <Link href="/service-contracts" className="font-semibold text-navy-700 underline underline-offset-2">
                service contracts
              </Link>
              .
            </>
          }
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
          {services.map(({ id, title, icon: Icon, body }) => (
            <li key={id} className="flex flex-col rounded-[var(--radius-md)] border border-line bg-white p-6">
              <span className="flex size-10 items-center justify-center rounded-[var(--radius-sm)] bg-navy-100 text-navy-700" aria-hidden>
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-ink">{title}</h3>
              <p className="mt-2 flex-1 leading-relaxed text-slate">{body}</p>
              <Link
                href={`/services?service=${id}#request`}
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 self-start font-semibold text-navy-700 underline-offset-2 hover:underline"
              >
                Request Service<span className="sr-only">: {title}</span>
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
          <li className="flex flex-col justify-center rounded-[var(--radius-md)] border border-dashed border-line-strong bg-surface p-6">
            <h3 className="text-lg font-bold text-ink">Need something else?</h3>
            <p className="mt-2 leading-relaxed text-slate">Describe the problem in a service request, or call us and we&apos;ll let you know how we can help.</p>
            <a href={`tel:${business.phone.e164}`} className="mt-3 inline-flex min-h-11 items-center gap-2 self-start font-semibold text-navy-700 underline-offset-2 hover:underline">
              <Phone className="size-4" aria-hidden /> {business.phone.display}
            </a>
          </li>
        </ul>
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
          <div className="grid content-start gap-10">
            <section aria-labelledby="how-heading" data-reveal>
              <p className="eyebrow mb-2">How it works</p>
              <h2 id="how-heading" className={h2}>
                How service requests work
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

            <p className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-line-strong bg-white p-4 leading-relaxed text-ink" data-reveal>
              <Info className="mt-1 size-4 shrink-0 text-navy-700" aria-hidden />
              <span>
                Stranded somewhere unsafe? Get yourself to a safe spot and call 911 first. For help with your vehicle during business hours, calling{" "}
                <a href={`tel:${business.phone.e164}`} className="font-semibold text-navy-700 underline underline-offset-2">
                  {business.phone.display}
                </a>{" "}
                is the fastest way to reach us.
              </span>
            </p>

            <aside aria-label="Staff note" className="rounded-[var(--radius-sm)] border border-dashed border-line-strong bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Staff note</p>
              <div className="mt-2">
                <TodoFlag>Confirm the mechanic certification type, service area, and towing availability</TodoFlag>
              </div>
            </aside>
          </div>

          <div id="request" className="self-start rounded-[var(--radius-md)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink">Request Service</h2>
            <p className="mt-2 leading-relaxed text-slate">This is a request, not a confirmed appointment. We&apos;ll contact you to confirm the details.</p>
            <a href={`tel:${business.phone.e164}`} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-slate hover:text-ink">
              <Phone className="size-4 text-navy-700" aria-hidden />
              Prefer to talk? Call <span className="font-semibold text-navy-700 underline underline-offset-2">{business.phone.display}</span>
            </a>
            <div className="mt-5">
              <ServiceRequestForm defaultService={defaultService} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
