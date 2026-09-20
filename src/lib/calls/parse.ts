import { cleanLine, cleanText, normalizePhone } from "../leads/sanitize.ts";
import type { ParseResult } from "./types.ts";

/**
 * Turns an incoming body into a call record. Accepts either:
 *  - Vapi's own server message: { message: { type: "end-of-call-report", call, artifact, analysis, ... } }
 *    (or that inner `message` object on its own), or
 *  - the flat JSON an n8n "Edit Fields" node produces (snake_case, documented in
 *    docs/vapi-n8n-integration.md).
 *
 * Vapi's docs confirm the envelope (message.type, endedReason, call, artifact.transcript). The
 * analysis / timestamp / structured-data locations below are read defensively from every
 * plausible path and left null when absent — a missing field never becomes a made-up value.
 */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** First candidate path that yields a non-empty value. */
function pick(root: Obj, ...paths: string[]): unknown {
  for (const path of paths) {
    let cur: unknown = root;
    for (const key of path.split(".")) {
      if (!isObj(cur)) {
        cur = undefined;
        break;
      }
      cur = cur[key];
    }
    if (cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return undefined;
}

const str = (v: unknown, max: number): string | null => {
  if (typeof v === "number" && Number.isFinite(v)) v = String(v);
  if (typeof v !== "string") return null;
  return cleanLine(v, max) || null;
};

const longText = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  return cleanText(v, max) || null;
};

function isoTime(v: unknown): string | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const t = new Date(v);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

function bool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "yes", "y", "1"].includes(s)) return true;
    if (["false", "no", "n", "0"].includes(s)) return false;
  }
  return null;
}

/** Structured-data values may be a string, boolean, or small object; flatten to readable text. */
function describe(v: unknown, max = 300): string | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "boolean") return v ? "Requested" : null;
  if (typeof v === "string" || typeof v === "number") return str(v, max);
  if (isObj(v)) {
    const parts = Object.entries(v)
      .filter(([, val]) => val !== null && val !== undefined && val !== "" && typeof val !== "object")
      .map(([k, val]) => `${k}: ${String(val)}`);
    return str(parts.join("; "), max);
  }
  return null;
}

export const MAX_TRANSCRIPT = 200_000;

export function parseCallReport(body: unknown): ParseResult {
  if (!isObj(body)) return { ok: false, error: "Body must be a JSON object." };

  // Unwrap Vapi's { message: {...} } envelope when present.
  const root: Obj = isObj(body.message) ? body.message : body;

  const type = pick(root, "type");
  if (typeof type === "string" && type !== "end-of-call-report") {
    return { ok: false, error: `Unsupported event type "${cleanLine(type, 40)}". Only end-of-call-report is accepted.` };
  }

  const vapiCallId = str(pick(root, "call.id", "vapi_call_id", "call_id", "callId"), 120);
  if (!vapiCallId) return { ok: false, error: "Missing call id." };
  // The id is used as a lookup key and is echoed back — keep it to a safe character set.
  if (!/^[A-Za-z0-9._:-]{1,120}$/.test(vapiCallId)) return { ok: false, error: "Call id has unexpected characters." };

  const structured = pick(root, "analysis.structuredData", "structured_data", "structuredData");
  const sd: Obj = isObj(structured) ? structured : {};
  const sdPick = (...keys: string[]) => {
    for (const k of keys) if (sd[k] !== undefined && sd[k] !== null && sd[k] !== "") return sd[k];
    return undefined;
  };

  const callerNumber = str(pick(root, "call.customer.number", "customer.number", "caller_number", "caller_phone", "phone"), 40);

  const startedAt = isoTime(pick(root, "call.startedAt", "startedAt", "started_at"));
  const endedAt = isoTime(pick(root, "call.endedAt", "endedAt", "ended_at"));

  let durationSeconds: number | null = null;
  const dur = pick(root, "durationSeconds", "duration_seconds", "call.durationSeconds");
  const durMs = pick(root, "durationMs", "call.durationMs");
  if (typeof dur === "number" || (typeof dur === "string" && dur.trim() !== "" && !Number.isNaN(Number(dur)))) durationSeconds = Number(dur);
  else if (typeof durMs === "number") durationSeconds = durMs / 1000;
  else if (startedAt && endedAt) durationSeconds = (Date.parse(endedAt) - Date.parse(startedAt)) / 1000;
  if (durationSeconds !== null && (!Number.isFinite(durationSeconds) || durationSeconds < 0 || durationSeconds > 86_400)) durationSeconds = null;
  if (durationSeconds !== null) durationSeconds = Math.round(durationSeconds);

  const callback = bool(sdPick("callbackRequested", "callback_requested", "callbackRequest", "wantsCallback")) ?? bool(pick(root, "callback_requested"));

  return {
    ok: true,
    call: {
      vapiCallId,
      callerNumber,
      callerPhone: normalizePhone(callerNumber ?? "") || null,
      callerName: str(pick(root, "call.customer.name", "customer.name", "caller_name") ?? sdPick("callerName", "caller_name", "name", "customerName"), 120),
      assistantId: str(pick(root, "call.assistantId", "assistant.id", "assistantId", "assistant_id"), 120),
      transcript: longText(pick(root, "artifact.transcript", "transcript"), MAX_TRANSCRIPT),
      summary: longText(pick(root, "analysis.summary", "summary"), 5000),
      endedReason: str(pick(root, "endedReason", "call.endedReason", "ended_reason"), 120),
      startedAt,
      endedAt,
      durationSeconds,
      outcome: str(pick(root, "outcome") ?? sdPick("outcome", "callOutcome", "call_outcome"), 80),
      vehicleInterest: describe(pick(root, "vehicle_interest") ?? sdPick("vehicleOfInterest", "vehicle_of_interest", "vehicleInterest", "vehicle_interest", "vehicle"), 200),
      testDrive: describe(pick(root, "test_drive") ?? sdPick("testDriveRequest", "test_drive_request", "testDriveRequested", "testDrive", "test_drive"), 300),
      callbackRequested: callback,
      callbackDetails: describe(pick(root, "callback_details") ?? sdPick("callbackDetails", "callback_details", "callbackTime", "preferredCallbackTime"), 300),
    },
  };
}
