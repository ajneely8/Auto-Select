"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Phone } from "lucide-react";
import { maskVin, formatMiles, formatPrice, displayPrice, vehicleTitle } from "@/lib/format";
import { useRecentlyViewed } from "@/lib/shopping/store";
import { useVehicleSummaries } from "@/lib/shopping/useVehicleSummaries";
import { track } from "@/lib/analytics";
import { business } from "@/config/business";
import { buttonClasses } from "@/components/ui/Button";

export function VinDisplay({ vin }: { vin: string }) {
  const [masked, setMasked] = useState(true);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono text-[0.8125rem] tracking-wide text-ink" aria-label={masked ? "VIN partially hidden" : `VIN ${vin.split("").join(" ")}`}>
        {masked ? maskVin(vin) : vin}
      </span>
      <button type="button" onClick={() => setMasked((m) => !m)} aria-pressed={!masked} className="inline-flex size-9 items-center justify-center rounded-[var(--radius-xs)] text-muted hover:bg-surface hover:text-ink" aria-label={masked ? "Show full VIN" : "Hide VIN"}>
        {masked ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
      </button>
    </span>
  );
}

/** Records the view (recently viewed + analytics) and renders other recently viewed vehicles. */
export function RecentlyViewed({ currentId, stockNumber, make, model, year, bodyStyle }: { currentId?: string; stockNumber?: string; make?: string; model?: string; year?: number; bodyStyle?: string | null }) {
  const { ids, add } = useRecentlyViewed();
  const [others, setOthers] = useState<string[]>([]);

  useEffect(() => {
    // Snapshot the list before adding the current vehicle so it doesn't show itself.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOthers(ids.filter((id) => id !== currentId).slice(0, 4));
    if (currentId) {
      add(currentId);
      track("vehicle_view", { stock_number: stockNumber, make, model, year, body_style: bodyStyle ?? undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  const { vehicles } = useVehicleSummaries(others);
  if (!vehicles.length) return null;
  return (
    <section aria-labelledby="recent-heading" className="mt-14">
      <h2 id="recent-heading" className="font-display text-2xl font-bold">
        Recently viewed
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {vehicles.map((v) => (
          <li key={v.id}>
            <Link href={`/inventory/${v.slug}`} className="group flex gap-3 rounded-[var(--radius-md)] border border-line bg-white p-2 hover:border-line-strong hover:shadow-[var(--shadow-card)]">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface-2">
                {v.photos[0] && <Image src={v.photos[0].url} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink group-hover:underline">{vehicleTitle(v)}</p>
                <p className="text-sm font-semibold tabular text-ink">{formatPrice(displayPrice(v))}</p>
                <p className="text-xs text-muted tabular">{formatMiles(v.mileage)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Sticky mobile action bar for vehicle pages; appears after the header price scrolls away. */
export function MobileVdpBar({ price, title }: { price: number | null; title: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const target = document.getElementById("vdp-price");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(target);
    return () => io.disconnect();
  }, []);
  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/97 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-200 lg:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{title}</p>
          <p className="font-display text-lg font-bold leading-tight tabular">{formatPrice(price)}</p>
        </div>
        <a href={`tel:${business.phone.e164}`} tabIndex={show ? 0 : -1} className={buttonClasses("outline", "md", "px-3")} aria-label={`Call ${business.phone.display}`}>
          <Phone className="size-4" aria-hidden /> Call
        </a>
        <a href="#availability" tabIndex={show ? 0 : -1} className={buttonClasses("primary", "md")}>
          Check Availability
        </a>
      </div>
    </div>
  );
}
