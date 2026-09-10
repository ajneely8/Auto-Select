"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { mapsLinks } from "@/config/business";
import { FormShell } from "./FormShell";
import { RadioGroupField, ContactFields, ConsentFields, FormSection } from "./fields";
import { SlotPicker } from "./SlotPicker";

export type AppointmentKind = "test-drive" | "dealership-visit" | "phone-consultation" | "service";

const KINDS: { value: AppointmentKind; label: string }[] = [
  { value: "test-drive", label: "Test drive" },
  { value: "dealership-visit", label: "Dealership visit" },
  { value: "phone-consultation", label: "Phone consultation" },
  { value: "service", label: "Service" },
];

/**
 * Appointment request. The success message comes from the server, which says whether the slot
 * was confirmed by the scheduling provider or is still a request — nothing here claims confirmation.
 */
export function AppointmentForm({ defaultKind, vehicleId, vehicleLabel }: { defaultKind?: AppointmentKind; vehicleId?: string; vehicleLabel?: string }) {
  return (
    <FormShell
      formType="appointment"
      submitLabel="Request Appointment"
      successTitle="Request received"
      successNext={
        <>
          Planning to visit?{" "}
          <a href={mapsLinks.directions} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-700 underline underline-offset-2">
            Get directions<span className="sr-only"> (opens in new tab)</span>
          </a>{" "}
          or{" "}
          <Link href="/inventory" className="font-semibold text-navy-700 underline underline-offset-2">
            browse our inventory
          </Link>
          .
        </>
      }
    >
      {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}
      {vehicleLabel && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-line bg-surface p-3 text-sm text-slate">
          <Car className="mt-0.5 size-4 shrink-0 text-navy-700" aria-hidden />
          <span>
            Vehicle: <span className="font-semibold text-ink">{vehicleLabel}</span>
          </span>
        </p>
      )}

      <FormSection title="Appointment">
        {/* Keyed so a new ?type= value (client-side navigation) resets the uncontrolled radios. */}
        <RadioGroupField key={defaultKind ?? "none"} name="kind" legend="What would you like to schedule?" required defaultValue={defaultKind} options={KINDS} />
        <SlotPicker />
      </FormSection>

      <FormSection title="Your contact info">
        <ContactFields
          messageLabel="Anything we should prepare?"
          messagePlaceholder="Vehicles you'd like to see, trade-in details, or questions you'd like answered."
        />
      </FormSection>

      <ConsentFields />
    </FormShell>
  );
}
