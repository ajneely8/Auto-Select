import Link from "next/link";
import { Phone, Clock, MapPin, BadgeDollarSign } from "lucide-react";
import { business, mapsLinks } from "@/config/business";

export function UtilityBar() {
  return (
    <div className="hidden md:block bg-navy-950 text-white/85 text-[0.8125rem] on-dark">
      <div className="container-page flex h-9 items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <a href={`tel:${business.phone.e164}`} className="inline-flex items-center gap-1.5 font-semibold text-white hover:underline underline-offset-2">
            <Phone className="size-3.5" aria-hidden />
            {business.phone.display}
          </a>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            <span>
              Mon–Sat 10 AM–6 PM <span className="text-white/60">· Sun closed</span>
            </span>
          </span>
          <a href={mapsLinks.directions} target="_blank" rel="noopener noreferrer" data-track="directions" className="hidden lg:inline-flex items-center gap-1.5 hover:text-white hover:underline underline-offset-2">
            <MapPin className="size-3.5" aria-hidden />
            {business.address.street}, {business.address.city}, {business.address.region}
          </a>
        </div>
        <Link href="/financing" className="inline-flex items-center gap-1.5 font-semibold text-white hover:underline underline-offset-2">
          <BadgeDollarSign className="size-3.5" aria-hidden />
          Get pre-qualified
        </Link>
      </div>
    </div>
  );
}
