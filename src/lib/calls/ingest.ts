import { createHash, timingSafeEqual } from "node:crypto";
import { cleanLine, normalizePhone } from "../leads/sanitize.ts";
import { parseCallReport } from "./parse.ts";
import type { CallLogStore } from "./store.ts";

/**
 * Request handling for POST /api/integrations/vapi/call-logs, kept free of Next.js and env
 * imports so it can be tested directly. The route file wires in the real token, store, and
 * contact lookup.
 */

export const MAX_BODY_BYTES = 1_000_000;
export const MIN_TOKEN_LENGTH = 16;

export interface ContactMatch {
  contactId: string;
  contactName: string;
}

export interface IngestDeps {
  /** The server-side secret. When unset, blank, or shorter than 16 characters the endpoint refuses everything (fails closed). */
  token: string | undefined;
  store: CallLogStore;
  findContact: (phoneE164: string) => Promise<ContactMatch | null>;
}

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Compares hashes, so neither the value nor its length can be probed through timing. */
function tokenMatches(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** Links a caller to a CRM contact by exact normalized phone match, most recent contact wins. Never invents one. */
export function matchContactByPhone(
  phoneE164: string,
  leads: { id: string; firstName: string; lastName: string; phone: string; status: string; createdAt: string }[],
): ContactMatch | null {
  if (!phoneE164) return null;
  const hits = leads
    .filter((l) => l.status !== "spam" && normalizePhone(l.phone) === phoneE164)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const best = hits[0];
  if (!best) return null;
  // Chat-captured leads store "-" as a placeholder last name; don't show that.
  const name = [best.firstName, best.lastName === "-" ? "" : best.lastName].filter(Boolean).join(" ");
  return { contactId: best.id, contactName: cleanLine(name, 120) || "(no name)" };
}

export async function handleCallLogRequest(req: Request, deps: IngestDeps): Promise<Response> {
  if (!deps.token || deps.token.length < MIN_TOKEN_LENGTH) return json({ success: false, error: "Call-log integration is not configured on the server." }, 503);

  const header = req.headers.get("authorization") ?? "";
  const given = /^Bearer\s+(.+)$/i.exec(header)?.[1]?.trim() ?? "";
  if (!given || !tokenMatches(given, deps.token)) return json({ success: false, error: "Unauthorized" }, 401);

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return json({ success: false, error: "Request too large." }, 413);

  let text: string;
  try {
    text = await req.text();
  } catch {
    return json({ success: false, error: "Could not read the request body." }, 400);
  }
  if (text.length > MAX_BODY_BYTES) return json({ success: false, error: "Request too large." }, 413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ success: false, error: "Body must be valid JSON." }, 400);
  }

  const parsed = parseCallReport(body);
  if (!parsed.ok) return json({ success: false, error: parsed.error }, 400);

  let match: ContactMatch | null = null;
  if (parsed.call.callerPhone) {
    try {
      match = await deps.findContact(parsed.call.callerPhone);
    } catch {
      // A lookup failure must not lose the call — save it unlinked.
      match = null;
    }
  }

  try {
    const result = await deps.store.save(parsed.call, body, match);
    return json({ success: true, call_id: result.call.vapiCallId, duplicate: result.duplicate }, result.duplicate ? 200 : 201);
  } catch (err) {
    // Deliberately no transcript, payload, or message text in the log — only the error class.
    console.error("[vapi-call-logs] save failed:", err instanceof Error ? err.name : "unknown");
    return json({ success: false, error: "Could not save the call log." }, 500);
  }
}
