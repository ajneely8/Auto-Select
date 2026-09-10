import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { business, fullAddress } from "@/config/business";

export interface BannerStep {
  icon: LucideIcon;
  title: string;
}

/**
 * A coded recreation of Auto Select's own black-and-gold print flyer ("Made Simple. / 3 Easy Steps"),
 * built as real markup rather than an embedded image: crisp at any size, real accessible text, and the
 * phone/address/logo stay wired to the single source of truth in src/config/business.ts instead of
 * being baked into pixels.
 */
export function ThreeEasyStepsBanner({ steps }: { steps: BannerStep[] }) {
  const websiteLabel = business.email.split("@")[1] ? `www.${business.email.split("@")[1]}` : undefined;

  return (
    <section aria-labelledby="process-heading" className="relative overflow-hidden bg-black py-16 sm:py-20">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 opacity-90"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(198,155,34,0.55) 0%, rgba(198,155,34,0) 70%)" }}
      />
      <div className="container-page relative text-center">
        <p className="font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-5xl" data-reveal>
          Made <span className="text-accent">Simple.</span>
        </p>

        <h2 id="process-heading" className="mx-auto mt-5 inline-block font-display text-2xl font-bold uppercase tracking-wide text-accent sm:text-4xl" data-reveal>
          3 Easy Steps
          <span aria-hidden className="mt-2 block h-0.5 w-full bg-accent" />
        </h2>

        <ol className="mx-auto mt-10 grid max-w-4xl gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/15">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col items-center gap-4 px-6" data-reveal>
              <p className="text-sm font-bold uppercase tracking-wide text-white">{s.title}</p>
              <s.icon className="size-16 text-white" strokeWidth={1.25} aria-hidden />
              <span className="sr-only">Step {i + 1}</span>
            </li>
          ))}
        </ol>

        <Image src="/brand-logo.png" alt={business.name} width={200} height={79} className="mx-auto mt-12 h-16 w-auto sm:h-20" />

        <p className="mt-6 font-display text-lg font-bold uppercase tracking-wide text-accent sm:text-xl" data-reveal>
          Experience the new way to buy a car!
        </p>

        <address className="mt-4 not-italic text-white/85">{fullAddress}</address>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-white/70">Give us a call at</p>
        <a href={`tel:${business.phone.e164}`} className="mt-1 block font-display text-3xl font-bold tabular text-accent hover:text-accent-hover sm:text-4xl">
          {business.phone.display}
        </a>
        {websiteLabel && <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/70">{websiteLabel}</p>}
      </div>
    </section>
  );
}
