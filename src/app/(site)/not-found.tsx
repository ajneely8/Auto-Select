import Link from "next/link";
import { CarFront, Phone, SearchCheck } from "lucide-react";
import { business } from "@/config/business";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="bg-surface">
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">We couldn&apos;t find that page</h1>
        <p className="mt-4 max-w-xl text-lg text-slate">
          The page may have moved, or the vehicle you were looking at may have sold. Here are the quickest ways to keep shopping.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/inventory" className={buttonClasses("primary", "lg")}>
            <CarFront className="size-4" aria-hidden /> Browse inventory
          </Link>
          <Link href="/find-a-vehicle" className={buttonClasses("outline", "lg")}>
            <SearchCheck className="size-4" aria-hidden /> Ask us to find a vehicle
          </Link>
          <Link href="/contact" className={buttonClasses("outline", "lg")}>
            Contact us
          </Link>
        </div>
        <a href={`tel:${business.phone.e164}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-navy-700 underline underline-offset-2">
          <Phone className="size-4" aria-hidden /> {business.phone.display}
        </a>
      </div>
    </div>
  );
}
