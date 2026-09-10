"use client";

import { useEffect, useState } from "react";
import { Phone, MessageSquareText, CalendarDays } from "lucide-react";
import { FormShell } from "@/components/forms/FormShell";
import { ContactFields, ConsentFields } from "@/components/forms/fields";
import { SlotPicker } from "@/components/forms/SlotPicker";
import { business } from "@/config/business";

type Mode = "availability" | "test-drive";

/**
 * Desktop: sticky card beside the gallery. Mobile: inline section (#availability) reached via the sticky bar.
 * Links to #availability or #test-drive open the matching tab.
 */
export function LeadCard({ vehicleId, vehicleLabel, stockNumber, sold }: { vehicleId: string; vehicleLabel: string; stockNumber: string; sold?: boolean }) {
  const [mode, setMode] = useState<Mode>("availability");

  useEffect(() => {
    const sync = () => {
      if (location.hash === "#test-drive") setMode("test-drive");
      if (location.hash === "#availability") setMode("availability");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  if (sold) {
    return (
      <div className="rounded-[var(--radius-md)] border border-line bg-white p-5">
        <p className="font-semibold text-ink">This vehicle has been sold.</p>
        <p className="mt-1 text-sm text-slate">We can help you find a similar one — call {business.phone.display} or use our vehicle locator.</p>
      </div>
    );
  }

  return (
    <div id="availability" className="scroll-mt-28 rounded-[var(--radius-md)] border border-line bg-white shadow-[var(--shadow-card)]">
      <span id="test-drive" className="block scroll-mt-28" aria-hidden />
      <div role="tablist" aria-label="Contact options" className="grid grid-cols-2 border-b border-line">
        {(
          [
            ["availability", "Check availability", MessageSquareText],
            ["test-drive", "Schedule test drive", CalendarDays],
          ] as const
        ).map(([m, label, Icon]) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            aria-controls={`lead-panel-${m}`}
            id={`lead-tab-${m}`}
            onClick={() => setMode(m)}
            className="inline-flex min-h-12 items-center justify-center gap-2 border-b-2 border-transparent px-2 text-sm font-semibold text-slate aria-selected:border-accent-text aria-selected:text-ink"
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>
      <div className="p-5">
        <div id="lead-panel-availability" role="tabpanel" aria-labelledby="lead-tab-availability" hidden={mode !== "availability"}>
          <p className="mb-4 text-sm text-slate">
            Ask about the <strong className="text-ink">{vehicleLabel}</strong> (stock {stockNumber}). We&apos;ll confirm it&apos;s available and answer any questions.
          </p>
          <FormShell formType="availability" submitLabel="Check Availability" successTitle="Request received" compact analyticsExtra={{ stock_number: stockNumber }}>
            <input type="hidden" name="vehicleId" value={vehicleId} />
            <ContactFields messageLabel="Questions (optional)" messagePlaceholder="Is it still available? Can I see it this Saturday?" />
            <ConsentFields />
          </FormShell>
        </div>
        <div id="lead-panel-test-drive" role="tabpanel" aria-labelledby="lead-tab-test-drive" hidden={mode !== "test-drive"}>
          <p className="mb-4 text-sm text-slate">Pick a time that works for you. We&apos;ll contact you to confirm before your visit.</p>
          <FormShell formType="test-drive" submitLabel="Request Test Drive" successTitle="Test-drive request received" compact analyticsExtra={{ stock_number: stockNumber }}>
            <input type="hidden" name="vehicleId" value={vehicleId} />
            <SlotPicker />
            <ContactFields withMessage={false} />
            <ConsentFields />
          </FormShell>
        </div>
      </div>
      <div className="border-t border-line bg-surface px-5 py-4">
        <a href={`tel:${business.phone.e164}`} className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-line-strong bg-white text-sm font-semibold text-ink hover:border-ink">
          <Phone className="size-4" aria-hidden /> Call {business.phone.display}
        </a>
        <p className="mt-2 text-center text-xs text-muted">Mon–Sat 10 AM–6 PM · Sunday closed</p>
      </div>
    </div>
  );
}
