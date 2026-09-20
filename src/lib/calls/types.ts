/** A saved AI-receptionist call. Every optional field is null when the report didn't carry it — never guessed. */
export interface CallLog {
  /** Internal record id. */
  id: string;
  /** Vapi's call id — the idempotency key. */
  vapiCallId: string;
  callerNumber: string | null;
  /** Normalized +1XXXXXXXXXX when the number is a plausible US number, otherwise null. */
  callerPhone: string | null;
  callerName: string | null;
  assistantId: string | null;
  transcript: string | null;
  summary: string | null;
  endedReason: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  /** Only what the report or the AI analysis explicitly stated; null otherwise. */
  outcome: string | null;
  vehicleInterest: string | null;
  testDrive: string | null;
  callbackRequested: boolean | null;
  callbackDetails: string | null;
  /** Id of the matching CRM lead, when the caller's phone matched one reliably. */
  contactId: string | null;
  contactName: string | null;
  /** Original report, size-capped, kept for troubleshooting. Only shown behind the CRM login. */
  raw: unknown;
  createdAt: string;
}

export type ParsedCall = Omit<CallLog, "id" | "contactId" | "contactName" | "raw" | "createdAt">;

export type ParseResult = { ok: true; call: ParsedCall } | { ok: false; error: string };
