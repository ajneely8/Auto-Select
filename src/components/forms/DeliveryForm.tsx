"use client";

import { Car } from "lucide-react";
import { FormShell } from "./FormShell";
import { TextField, SelectField, TextareaField, ContactFields, ConsentFields, FormSection } from "./fields";

const WINDOWS = ["Weekday morning", "Weekday afternoon", "Saturday", "Flexible"].map((w) => ({ value: w, label: w }));

/**
 * Home/office delivery request. Pass `vehicleId` (and optionally a readable `vehicleLabel`)
 * when the customer arrives from a vehicle page.
 */
export function DeliveryForm({ vehicleId, vehicleLabel }: { vehicleId?: string; vehicleLabel?: string }) {
  return (
    <FormShell formType="delivery" submitLabel="Send Delivery Request" successTitle="Delivery request received">
      {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}
      {vehicleLabel && (
        <p className="flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-line bg-surface p-3 text-sm text-slate">
          <Car className="mt-0.5 size-4 shrink-0 text-navy-700" aria-hidden />
          <span>
            Vehicle: <span className="font-semibold text-ink">{vehicleLabel}</span>
          </span>
        </p>
      )}

      <FormSection title="Delivery address" description="Where would you like the vehicle delivered?">
        <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
          <TextField name="street" label="Street address" required maxLength={120} autoComplete="address-line1" errorLabel="a street address" />
          <TextField name="unit" label="Apt, suite, or unit" maxLength={40} autoComplete="address-line2" />
        </div>
        <div className="grid gap-5 sm:grid-cols-[1fr_5.5rem_8rem]">
          <TextField name="city" label="City" required maxLength={60} autoComplete="address-level2" errorLabel="a city" />
          <TextField
            name="state"
            label="State"
            required
            defaultValue="TX"
            maxLength={2}
            pattern="[A-Za-z]{2}"
            patternMessage="Use the 2-letter state code, like TX."
            autoComplete="address-level1"
            autoCapitalize="characters"
            errorLabel="a state"
          />
          <TextField
            name="zip"
            label="ZIP code"
            required
            inputMode="numeric"
            maxLength={10}
            pattern="\d{5}(-\d{4})?"
            patternMessage="Please enter a 5-digit ZIP code."
            autoComplete="postal-code"
            errorLabel="a ZIP code"
          />
        </div>
      </FormSection>

      <FormSection title="Delivery preferences">
        <SelectField name="preferredWindow" label="Preferred delivery window" placeholder="Choose a window" options={WINDOWS} />
        <TextareaField
          name="deliveryNotes"
          label="Delivery notes"
          rows={3}
          maxLength={600}
          placeholder="Gate codes, parking instructions, or the best place to meet."
        />
      </FormSection>

      <FormSection title="Your contact info">
        <ContactFields
          messageLabel={vehicleId ? "Questions for our team" : "Which vehicle are you interested in?"}
          messagePlaceholder={vehicleId ? "Anything you'd like us to know before we follow up." : "A stock number, or the year, make, and model."}
        />
      </FormSection>

      <ConsentFields />
    </FormShell>
  );
}
