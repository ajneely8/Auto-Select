import "server-only";
import { env } from "@/config/env";
import { postWebhook } from "@/lib/integrations";
import type { Appointment, AppointmentKind } from "@/lib/types";

/**
 * Provider-neutral scheduling interface. Connect Calendly, Google Calendar, a DMS/CRM appointment API, etc.
 * by implementing `SchedulingProvider` or pointing SCHEDULING_WEBHOOK_URL at a function that books the slot
 * and responds `{ "confirmed": true, "reference": "…" }`.
 *
 * The site NEVER tells a customer an appointment is confirmed unless the provider returns confirmed: true.
 */
export interface SchedulingRequest {
  kind: AppointmentKind;
  date: string;
  time: string;
  timezone: string;
  vehicleId: string | null;
  leadId: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
}

export interface SchedulingProvider {
  request(req: SchedulingRequest): Promise<Pick<Appointment, "status" | "providerReference">>;
}

const requestOnly: SchedulingProvider = {
  async request() {
    return { status: "requested", providerReference: null };
  },
};

const webhookProvider: SchedulingProvider = {
  async request(req) {
    try {
      const res = await postWebhook("scheduling", env.SCHEDULING_WEBHOOK_URL!, req, { retry: false });
      const data = (await res.json().catch(() => ({}))) as { confirmed?: boolean; reference?: string };
      return { status: data.confirmed ? "confirmed" : "requested", providerReference: data.reference ?? null };
    } catch {
      // Provider down: keep the request; staff confirm manually.
      return { status: "requested", providerReference: null };
    }
  },
};

export const scheduling: SchedulingProvider = env.SCHEDULING_WEBHOOK_URL ? webhookProvider : requestOnly;
