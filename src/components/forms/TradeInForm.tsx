"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { AlertCircle, Info } from "lucide-react";
import { FormShell, useFieldError } from "./FormShell";
import { TextField, CheckboxField, FileField, ContactFields, ConsentFields, FormSection } from "./fields";

const CONDITIONS = [
  { value: "excellent", label: "Excellent", description: "Drives like new. No warning lights, no damage, clean inside and out." },
  { value: "good", label: "Good", description: "Normal wear for its age. A few minor scratches or dings; everything works." },
  { value: "fair", label: "Fair", description: "Noticeable wear or cosmetic damage, or it needs some mechanical repairs." },
  { value: "rough", label: "Rough", description: "Major damage, warning lights, or mechanical problems. May not run reliably." },
] as const;

/** Keeps number-only fields clean (the server rejects "48,500" for whole-number fields). */
function keepDigits(e: FormEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  const clean = el.value.replace(/\D/g, "");
  if (clean !== el.value) el.value = clean;
}

/** Condition picker with a short description under each option. */
function ConditionField() {
  const f = useFieldError("tradeCondition");
  return (
    <fieldset aria-describedby={f.errorId}>
      <legend className="mb-2 text-sm font-semibold text-ink">
        Overall condition
        <span className="ml-0.5 text-accent-text" aria-hidden>
          *
        </span>
        <span className="sr-only"> (required)</span>
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {CONDITIONS.map((c) => (
          <label
            key={c.value}
            className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border bg-white p-3 transition-colors hover:border-slate has-[:checked]:border-navy-900 has-[:checked]:bg-navy-100 ${
              f.error ? "border-danger" : "border-line-strong"
            }`}
          >
            <input
              type="radio"
              name="tradeCondition"
              value={c.value}
              required
              data-label="the condition"
              onChange={() => f.setError(null)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-navy-900"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">{c.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate">{c.description}</span>
            </span>
          </label>
        ))}
      </div>
      <p id={f.errorId} className={f.error ? "mt-1.5 flex items-start gap-1.5 text-sm text-danger" : "sr-only"} aria-live="polite">
        {f.error && (
          <>
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {f.error}
          </>
        )}
      </p>
    </fieldset>
  );
}

function Group({ compact, title, description, children }: { compact: boolean; title: string; description?: ReactNode; children: ReactNode }) {
  if (compact) return <div className="grid gap-4">{children}</div>;
  return (
    <FormSection title={title} description={description}>
      {children}
    </FormSection>
  );
}

/**
 * Trade-in estimate form. `compact` drops the section headings for tighter placements (homepage);
 * every field is still included. Place it on a white background.
 */
export function TradeInForm({ compact = false }: { compact?: boolean }) {
  const gap = compact ? "gap-4" : "gap-5";
  return (
    <FormShell
      formType="trade-in"
      compact={compact}
      submitLabel="Get My Estimate"
      successTitle="Trade-in details received"
      successNext={
        <>
          While we review your vehicle,{" "}
          <Link href="/inventory" className="font-semibold text-navy-700 underline underline-offset-2">
            browse our inventory
          </Link>{" "}
          or{" "}
          <Link href="/financing" className="font-semibold text-navy-700 underline underline-offset-2">
            see how financing works
          </Link>
          .
        </>
      }
    >
      <p className="flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-line bg-surface p-3 text-sm leading-relaxed text-slate">
        <Info className="mt-0.5 size-4 shrink-0 text-navy-700" aria-hidden />
        <span>Online estimates are preliminary and subject to a physical inspection.</span>
      </p>

      <Group compact={compact} title="Your vehicle" description="The more we know, the more useful your estimate will be.">
        <TextField
          name="vinOrPlate"
          label="VIN or license plate"
          maxLength={20}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          hint="Helps us confirm the exact trim and equipment."
        />
        <div className={`grid ${gap} sm:grid-cols-2`}>
          <TextField
            name="tradeYear"
            label="Year"
            required
            inputMode="numeric"
            maxLength={4}
            pattern="(19|20)\d{2}"
            patternMessage="Please enter a 4-digit year, like 2019."
            errorLabel="the year"
            placeholder="2019"
            autoComplete="off"
            onInput={keepDigits}
          />
          <TextField name="tradeMake" label="Make" required maxLength={40} errorLabel="the make" placeholder="Toyota" autoComplete="off" />
          <TextField name="tradeModel" label="Model" required maxLength={60} errorLabel="the model" placeholder="Camry" autoComplete="off" />
          <TextField name="tradeTrim" label="Trim" maxLength={60} placeholder="SE" autoComplete="off" />
          <TextField
            name="tradeMileage"
            label="Current mileage"
            required
            inputMode="numeric"
            maxLength={6}
            pattern="\d{1,6}"
            patternMessage="Please enter the mileage using numbers only, like 48500."
            errorLabel="the mileage"
            placeholder="48500"
            autoComplete="off"
            onInput={keepDigits}
          />
          <TextField
            name="payoffAmount"
            label="Loan payoff amount"
            inputMode="decimal"
            maxLength={12}
            placeholder="$"
            autoComplete="off"
            hint="If you still owe on it — an estimate is fine."
          />
        </div>
        <ConditionField />
      </Group>

      <Group compact={compact} title="Photos" description="Clear photos help us give you a closer estimate.">
        <FileField name="photos" label="Photos of your vehicle" hint="Up to 6 photos, 8 MB each — front, back, both sides, interior, and odometer." />
      </Group>

      <Group compact={compact} title="Your contact info">
        <ContactFields
          withMessage={!compact}
          messageLabel="Anything else we should know?"
          messagePlaceholder="Recent repairs, aftermarket parts, a missing spare key, or known issues."
        />
      </Group>

      <CheckboxField
        name="contactConsent"
        required
        requiredMessage="Please confirm we may contact you about this estimate."
        label="I agree that Auto Select may contact me about this trade-in estimate using the contact information I provided."
      />
      <ConsentFields />
    </FormShell>
  );
}
