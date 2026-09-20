import { env } from "@/config/env";
import { listLeads } from "@/lib/crm/leads";
import { callLogStore } from "@/lib/calls";
import { handleCallLogRequest, matchContactByPhone } from "@/lib/calls/ingest";

/**
 * POST /api/integrations/vapi/call-logs
 *
 * Receives a Vapi end-of-call-report from n8n and saves it as a CRM call log.
 * Auth: `Authorization: Bearer <ATARO_CRM_API_TOKEN>`. See docs/vapi-n8n-integration.md.
 * Retries are safe — the Vapi call id is an idempotency key.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return handleCallLogRequest(req, {
    token: env.ATARO_CRM_API_TOKEN,
    store: callLogStore,
    findContact: async (phone) => matchContactByPhone(phone, await listLeads()),
  });
}
