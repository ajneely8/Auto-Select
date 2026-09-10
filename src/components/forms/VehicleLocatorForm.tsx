"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import Link from "next/link";
import { FormShell, useFieldError } from "./FormShell";
import { TextField, SelectField, TextareaField, RadioGroupField, ContactFields, ConsentFields, FormSection } from "./fields";

const CRITERIA_FIELDS = ["desiredMake", "desiredBody", "requiredFeatures"] as const;
const CRITERIA_MESSAGE = "Tell us at least a make, a body style, or the features you need.";

const BODY_STYLES = ["Sedan", "SUV / Crossover", "Pickup truck", "Coupe", "Hatchback", "Minivan", "Wagon", "Convertible", "Van"].map((b) => ({ value: b, label: b }));

/**
 * The server requires at least one of make / body style / features. This mirrors that rule in the browser:
 * after the first submit attempt, the Make field carries a custom validity message until one of the three is filled.
 */
function CriteriaGuard() {
  const anchor = useRef<HTMLSpanElement>(null);
  const { setError } = useFieldError("desiredMake");
  const clearMakeError = useEffectEvent(() => setError(null));

  useEffect(() => {
    const form = anchor.current?.closest("form");
    if (!form) return;
    let attempted = false;
    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    const apply = () => {
      const make = field("desiredMake");
      if (!make) return;
      const satisfied = CRITERIA_FIELDS.some((n) => (field(n)?.value ?? "").trim() !== "");
      make.setCustomValidity(satisfied ? "" : CRITERIA_MESSAGE);
      if (satisfied) clearMakeError();
    };
    // Native listener runs before React's submit handler, so FormShell sees the up-to-date validity.
    const onSubmit = () => {
      attempted = true;
      apply();
    };
    const onEdit = () => {
      if (attempted) apply();
    };
    form.addEventListener("submit", onSubmit);
    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);
    return () => {
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("input", onEdit);
      form.removeEventListener("change", onEdit);
    };
  }, []);

  return <span ref={anchor} hidden />;
}

export function VehicleLocatorForm() {
  return (
    <FormShell
      formType="vehicle-locator"
      submitLabel="Send My Vehicle Request"
      successTitle="Request received"
      successNext={
        <>
          In the meantime, you can{" "}
          <Link href="/inventory" className="font-semibold text-navy-700 underline underline-offset-2">
            browse our current inventory
          </Link>
          .
        </>
      }
    >
      <FormSection title="The vehicle" description="Tell us at least a make, a body style, or the features you need. Everything else is optional.">
        <RadioGroupField
          name="desiredCondition"
          legend="New or used?"
          defaultValue="either"
          options={[
            { value: "used", label: "Used" },
            { value: "new", label: "New" },
            { value: "either", label: "Either" },
          ]}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="desiredMake" label="Make" maxLength={40} placeholder="Toyota" autoComplete="off" errorLabel="a make" />
          <TextField name="desiredModel" label="Model" maxLength={60} placeholder="Tacoma" autoComplete="off" />
          <TextField name="desiredTrim" label="Trim" maxLength={60} placeholder="TRD Off-Road" autoComplete="off" />
          <SelectField name="desiredBody" label="Body style" placeholder="Any body style" options={BODY_STYLES} />
          <TextField name="yearMin" label="Earliest year" inputMode="numeric" maxLength={4} pattern="\d{4}" patternMessage="Please enter a 4-digit year, like 2018." placeholder="2018" autoComplete="off" />
          <TextField name="yearMax" label="Latest year" inputMode="numeric" maxLength={4} pattern="\d{4}" patternMessage="Please enter a 4-digit year, like 2023." placeholder="2023" autoComplete="off" />
          <TextField name="exteriorColors" label="Exterior color(s)" maxLength={120} placeholder="White, gray, or black" autoComplete="off" />
          <TextField name="interiorColors" label="Interior color(s)" maxLength={120} placeholder="Black or tan" autoComplete="off" />
          <TextField name="maxMileage" label="Maximum mileage" inputMode="numeric" maxLength={9} placeholder="60,000" autoComplete="off" />
        </div>
        <TextareaField
          name="requiredFeatures"
          label="Must-have features"
          maxLength={600}
          rows={3}
          placeholder="Third-row seating, 4x4, towing package, Apple CarPlay, heated seats…"
        />
      </FormSection>

      <FormSection title="Budget" description="Share whatever you're comfortable with — it helps us focus the search.">
        <TextField name="budget" label="Total budget" inputMode="numeric" maxLength={12} placeholder="$25,000" autoComplete="off" hint="The most you'd like to spend on the vehicle." />
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Estimated monthly payment range (an estimate only — not a quote)</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="monthlyMin" label="From (per month)" inputMode="numeric" maxLength={8} placeholder="$300" autoComplete="off" />
            <TextField name="monthlyMax" label="To (per month)" inputMode="numeric" maxLength={8} placeholder="$450" autoComplete="off" />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Actual payments depend on the vehicle&apos;s price, your down payment, the loan term, and lender approval.
          </p>
        </fieldset>
      </FormSection>

      <FormSection title="Timing & trade-in">
        <RadioGroupField
          name="timeline"
          legend="When are you hoping to buy?"
          options={[
            { value: "asap", label: "As soon as possible" },
            { value: "30-days", label: "Within 30 days" },
            { value: "60-days", label: "Within 60 days" },
            { value: "90-days-plus", label: "90 days or more" },
            { value: "researching", label: "Just researching" },
          ]}
        />
        <RadioGroupField
          name="hasTradeIn"
          legend="Do you have a vehicle to trade in?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "unsure", label: "Not sure yet" },
          ]}
        />
      </FormSection>

      <FormSection title="Your contact info">
        <ContactFields
          messageLabel="Notes"
          messagePlaceholder="Deal-breakers, how you'll use the vehicle, or anything else that would help our search."
        />
      </FormSection>

      <ConsentFields />
      {/* Last so the first FormSection keeps its :first-child styling. */}
      <CriteriaGuard />
    </FormShell>
  );
}
