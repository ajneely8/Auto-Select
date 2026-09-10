"use client";

import { Lock } from "lucide-react";
import { business } from "@/config/business";
import { FormShell } from "./FormShell";
import { RadioGroupField, ContactFields, ConsentFields, FormSection } from "./fields";

/** Financing questions only — never collects SSN, date of birth, or bank details. Applications go to the secure provider. */
export function FinancingInquiryForm() {
  return (
    <FormShell
      formType="financing"
      submitLabel="Send My Question"
      successTitle="Question received"
      successNext={
        <>
          Ready to apply?{" "}
          <a href={business.financing.applicationUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-700 underline underline-offset-2">
            Start secure pre-qualification<span className="sr-only"> (opens in new tab)</span>
          </a>
          .
        </>
      }
    >
      <div role="note" className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-[#f0d9a6] bg-warning-soft p-4 text-sm leading-relaxed text-ink">
        <Lock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        <p>
          Please don&apos;t include your Social Security number, date of birth, or bank details here. To apply, use our{" "}
          <a href={business.financing.applicationUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy-700 underline underline-offset-2">
            secure application<span className="sr-only"> (opens in new tab)</span>
          </a>
          .
        </p>
      </div>

      <FormSection title="Your question">
        <RadioGroupField
          name="financingTopic"
          legend="What can we help with?"
          options={[
            { value: "pre-qualification", label: "Getting pre-qualified" },
            { value: "first-time-buyer", label: "Buying my first car" },
            { value: "rebuilding-credit", label: "Rebuilding my credit" },
            { value: "general", label: "General question" },
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
          messageLabel="Anything we should know?"
          messagePlaceholder="The kind of vehicle you're considering, your timeline, or questions about how financing works."
        />
      </FormSection>

      <ConsentFields />
    </FormShell>
  );
}
