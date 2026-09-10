"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { X, Columns3 } from "lucide-react";
import { useCompare, MAX_COMPARE } from "@/lib/shopping/store";
import { useVehicleSummaries } from "@/lib/shopping/useVehicleSummaries";
import { vehicleTitle } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";

/** Appears only when at least one vehicle is selected for comparison (hidden on the compare page itself). */
export function CompareTray() {
  const pathname = usePathname();
  const { ids, toggle, clear } = useCompare();
  const { vehicles } = useVehicleSummaries(ids);
  const visible = ids.length > 0 && pathname !== "/compare";
  const ref = useRef<HTMLElement>(null);

  // Publish the tray height so other floating controls (assistant, back-to-top) sit above it.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible || !ref.current) {
      root.style.setProperty("--tray-h", "0px");
      return;
    }
    const el = ref.current;
    const ro = new ResizeObserver(() => root.style.setProperty("--tray-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--tray-h", "0px");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <section
      ref={ref}
      aria-label="Vehicles selected for comparison"
      className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-white shadow-[0_-8px_24px_-12px_rgb(17_20_24/0.25)] lg:bottom-0 animate-fade-up"
    >
      <div className="container-page flex items-center gap-3 py-2.5">
        <p className="hidden sm:block shrink-0 text-sm font-semibold text-ink">
          Compare <span className="tabular text-muted">({ids.length}/{MAX_COMPARE})</span>
        </p>
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto scrollbar-none">
          {vehicles.map((v) => (
            <li key={v.id} className="flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] border border-line bg-surface py-1 pl-1 pr-1.5">
              {v.photos[0] && <Image src={v.photos[0].url} alt="" width={56} height={42} className="h-9 w-12 rounded-[2px] object-cover" />}
              <span className="max-w-[9rem] truncate text-xs font-semibold text-ink">{vehicleTitle(v)}</span>
              <button type="button" onClick={() => toggle(v.id)} className="inline-flex size-8 items-center justify-center rounded-[var(--radius-xs)] text-muted hover:bg-white hover:text-ink" aria-label={`Remove ${vehicleTitle(v)} from comparison`}>
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={clear} className="hidden sm:inline-flex h-10 items-center px-2 text-sm text-slate underline underline-offset-2 hover:text-ink">
          Clear
        </button>
        <Link href={`/compare?ids=${ids.join(",")}`} className={buttonClasses("secondary", "md", "shrink-0")} aria-disabled={ids.length < 2}>
          <Columns3 className="size-4" aria-hidden />
          {ids.length < 2 ? "Add 1 more" : "Compare"}
        </Link>
      </div>
    </section>
  );
}
