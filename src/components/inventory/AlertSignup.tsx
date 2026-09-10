"use client";

import { FormShell } from "@/components/forms/FormShell";
import { TextField, CheckboxField } from "@/components/forms/fields";

/**
 * Opt-in email alerts for a saved search (or a specific vehicle's price changes).
 * Consent box is required and never pre-checked; every alert email carries an unsubscribe link,
 * and alerts are rate-limited to one email per 72 hours (see src/lib/automation/subscriptions.ts).
 */
export function AlertSignup({ query = "", vehicleId, title }: { query?: string; vehicleId?: string; title?: string }) {
  return (
    <div>
      <h3 className="font-display text-lg font-bold text-ink">{title ?? "Get an email when a match arrives"}</h3>
      <p className="mt-1 text-sm text-slate">
        {vehicleId ? "We'll email you if this vehicle's price changes, and at most one reminder about it." : "We'll email you when vehicles matching this search are added. No more than one email every three days."}
      </p>
      <div className="mt-4">
        <FormShell formType="inventory-alert" submitLabel="Create alert" successTitle="Alert created" compact>
          <input type="hidden" name="alertQuery" value={query} />
          {vehicleId && <input type="hidden" name="alertVehicleId" value={vehicleId} />}
          <TextField name="email" type="email" label="Email" autoComplete="email" required errorLabel="your email" />
          <CheckboxField
            name="alertConsent"
            required
            requiredMessage="Please confirm you'd like to receive these emails."
            label="Yes, email me about matching vehicles. I can unsubscribe at any time using the link in each email."
          />
        </FormShell>
      </div>
    </div>
  );
}
