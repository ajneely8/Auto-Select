"use client";

import { FormShell } from "./FormShell";
import { SelectField, ContactFields, ConsentFields } from "./fields";

const SUBJECTS = [
  "General question",
  "Inventory question",
  "Financing",
  "Trade-in",
  "Delivery",
  "Service contract",
  "Automotive service",
  "Other",
].map((s) => ({ value: s, label: s }));

/** General contact form. `defaultSubject` must match one of the topic labels above. */
export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  return (
    <FormShell formType="contact" submitLabel="Send Message" successTitle="Message received">
      <SelectField name="subject" label="Topic" placeholder="Choose a topic" options={SUBJECTS} defaultValue={defaultSubject ?? ""} />
      <ContactFields messageLabel="How can we help?" messagePlaceholder="Include a stock number or vehicle name if your question is about a specific car." />
      <ConsentFields />
    </FormShell>
  );
}
