"use client";

import { FormShell } from "./FormShell";
import { TextField, SelectField, RadioGroupField, ContactFields, ConsentFields, FormSection } from "./fields";

export type ServiceId = "mobile-mechanic" | "tires-balancing" | "body-paint" | "towing" | "jump-start" | "other";

const SERVICES: { value: ServiceId; label: string }[] = [
  { value: "mobile-mechanic", label: "Mobile mechanic assistance" },
  { value: "tires-balancing", label: "Tires & wheel balancing" },
  { value: "body-paint", label: "Body repair & painting" },
  { value: "towing", label: "Towing" },
  { value: "jump-start", label: "Jump start" },
  { value: "other", label: "Something else" },
];

/** Automotive service request (not an appointment — the team follows up to confirm). */
export function ServiceRequestForm({ defaultService }: { defaultService?: ServiceId }) {
  return (
    <FormShell formType="service" submitLabel="Request Service" successTitle="Service request received">
      <FormSection title="What you need">
        {/* Keyed so a new ?service= selection (client-side navigation) updates the uncontrolled select. */}
        <SelectField
          key={defaultService ?? "none"}
          name="service"
          label="Service"
          required
          placeholder="Choose a service"
          options={SERVICES}
          // `?? ""` matters: SelectField spreads props after its own default, and an explicit undefined
          // would let the browser preselect the first service instead of the placeholder.
          defaultValue={defaultService ?? ""}
          errorLabel="a service"
        />
        <TextField
          name="vehicleDescription"
          label="Vehicle year, make, and model"
          required
          maxLength={120}
          placeholder="2016 Ford F-150"
          autoComplete="off"
          errorLabel="your vehicle's year, make, and model"
        />
        <TextField
          name="location"
          label="Where is the vehicle?"
          maxLength={160}
          autoComplete="off"
          hint="For mobile mechanic, towing, and jump-start requests — an address, cross streets, or a landmark."
        />
        <RadioGroupField
          name="urgency"
          legend="How soon do you need help?"
          defaultValue="flexible"
          hint="We'll confirm availability and timing when we contact you."
          options={[
            { value: "today", label: "Today" },
            { value: "this-week", label: "This week" },
            { value: "flexible", label: "I'm flexible" },
          ]}
        />
      </FormSection>

      <FormSection title="Your contact info">
        <ContactFields messageLabel="Describe the problem" messagePlaceholder="What's happening, any warning lights, and anything you've already tried." />
      </FormSection>

      <ConsentFields />
    </FormShell>
  );
}
