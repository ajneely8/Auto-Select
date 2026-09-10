"use client";

import type { FormEvent } from "react";
import { FormShell } from "./FormShell";
import { TextField, ContactFields, ConsentFields, FormSection } from "./fields";

function keepDigits(e: FormEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  const clean = el.value.replace(/\D/g, "");
  if (clean !== el.value) el.value = clean;
}

/** Service-contract quote request: VIN + mileage + contact. */
export function ServiceContractQuoteForm() {
  return (
    <FormShell formType="service-contract" submitLabel="Request a Quote" successTitle="Quote request received">
      <FormSection title="Your vehicle">
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <TextField
            name="vin"
            label="VIN"
            required
            maxLength={17}
            pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}"
            patternMessage="Please enter the 17-character VIN. VINs never use the letters I, O, or Q."
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            errorLabel="the 17-character VIN"
            hint="On the driver's side of the dashboard (visible through the windshield), the driver's door jamb, or your registration or insurance card."
          />
          <TextField
            name="contractMileage"
            label="Current mileage"
            required
            inputMode="numeric"
            maxLength={6}
            pattern="\d{1,6}"
            patternMessage="Please enter the mileage using numbers only, like 62000."
            placeholder="62000"
            autoComplete="off"
            errorLabel="the mileage"
            onInput={keepDigits}
          />
        </div>
      </FormSection>

      <FormSection title="Your contact info">
        <ContactFields messageLabel="Questions about coverage" messagePlaceholder="What you'd like covered, how long you plan to keep the vehicle, or anything else." />
      </FormSection>

      <ConsentFields />
    </FormShell>
  );
}
