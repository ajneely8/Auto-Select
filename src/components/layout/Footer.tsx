import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { business, mapsLinks, fullAddress } from "@/config/business";
import { footerNav } from "@/config/site";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="currentColor">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-950 text-white/80 on-dark pb-20 lg:pb-0" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Image src="/brand-logo.png" alt={business.name} width={200} height={79} className="h-12 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            A family-owned online dealership in Live Oak, Texas. Browse our inventory, get financing help, value your trade, or let us find the right vehicle for
            you.
          </p>
          <ul className="mt-6 grid gap-3 text-sm">
            <li>
              <a href={`tel:${business.phone.e164}`} className="inline-flex items-center gap-2.5 font-semibold text-white hover:underline underline-offset-2">
                <Phone className="size-4 text-white/60" aria-hidden /> {business.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2.5 hover:text-white hover:underline underline-offset-2">
                <Mail className="size-4 text-white/60" aria-hidden /> {business.email}
              </a>
            </li>
            <li>
              <a href={mapsLinks.directions} target="_blank" rel="noopener noreferrer" data-track="directions" className="inline-flex items-start gap-2.5 hover:text-white hover:underline underline-offset-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
                <address className="not-italic">{fullAddress}</address>
              </a>
            </li>
            <li className="inline-flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
              <span>
                {business.hoursSummary.map((h) => (
                  <span key={h.label} className="block">
                    {h.label}: {h.value}
                  </span>
                ))}
              </span>
            </li>
          </ul>
          <div className="mt-6 flex gap-2">
            <a href={business.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Auto Select on Facebook" className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-white/15 hover:border-white/50 hover:text-white">
              <FacebookIcon />
            </a>
            <a href={business.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Auto Select on Instagram" className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-white/15 hover:border-white/50 hover:text-white">
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {(
            [
              ["Shop", footerNav.shop],
              ["Buying tools", footerNav.buy],
              ["Auto Select", footerNav.company],
            ] as const
          ).map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-white">{title}</h3>
              <ul className="mt-4 grid gap-2.5 text-sm">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white hover:underline underline-offset-2">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page grid gap-4 py-6 text-xs leading-relaxed text-white/60">
          <p>
            Prices exclude tax, title, license, registration, and dealer fees. Vehicle information, photos, and equipment are provided in good faith but may
            contain errors — please confirm details, availability, and pricing with Auto Select before purchase. Financing is subject to lender approval;
            rates and terms depend on applicant qualifications.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {business.legalName}. All rights reserved.
            </p>
            <ul className="flex gap-5">
              {footerNav.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white hover:underline underline-offset-2">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
