import "server-only";
import { listLeads } from "@/lib/crm/leads";
import { formatPhone } from "@/lib/leads/sanitize";
import { matchContactByPhone } from "./ingest";
import type { CallLog } from "./types";

/**
 * Calls saved before a matching lead existed have no contact link. Resolve those at display time
 * (never written back), so a caller who submits a form later shows up linked on their earlier calls.
 */
export async function withContacts(calls: CallLog[]): Promise<CallLog[]> {
  if (!calls.some((c) => !c.contactId && c.callerPhone)) return calls;
  const leads = await listLeads();
  return calls.map((c) => {
    if (c.contactId || !c.callerPhone) return c;
    const m = matchContactByPhone(c.callerPhone, leads);
    return m ? { ...c, contactId: m.contactId, contactName: m.contactName } : c;
  });
}

export const callerLabel = (c: CallLog) => c.callerName ?? c.contactName ?? (c.callerPhone ? formatPhone(c.callerPhone) : (c.callerNumber ?? "Unknown caller"));

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** "test_drive" → "Test drive". Outcomes come straight from the report, so they're only tidied, never remapped. */
export const outcomeLabel = (o: string | null) => (o ? o.replace(/[_-]+/g, " ").replace(/^./, (ch) => ch.toUpperCase()) : "Not recorded");
