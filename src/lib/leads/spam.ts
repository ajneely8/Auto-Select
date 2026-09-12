import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/config/env";

/** Honeypot field name. Real users never see or fill it. */
export const HONEYPOT = "company_website";

/**
 * There used to also be a "too-fast" check (reject if submitted within N ms of the form
 * rendering). Removed: it depends on comparing the visitor's own device clock against the
 * server's, and repeatedly flagged genuine fast fills (autofill, or just a quick typist) as
 * spam — confirmed live twice, at both a 2500ms and a 1000ms threshold, catching real customer
 * submissions. The honeypot below has no such false-positive path (a hidden field only a script
 * would fill) and is what actually catches bots in practice.
 */
export function looksLikeBot(fields: Record<string, string>): string | null {
  if (fields[HONEYPOT]) return "honeypot";
  const text = `${fields.message ?? ""} ${fields.notes ?? ""}`;
  if ((text.match(/https?:\/\//g) ?? []).length > 3) return "link-spam";
  return null;
}

/** Optional Cloudflare Turnstile verification — enabled when TURNSTILE_SECRET_KEY is set. */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

/* ───────── Rate limiting (in-memory sliding window; swap for Redis/Upstash in multi-instance hosting) ───────── */

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  return { ok: true, retryAfterSec: 0 };
}

/* ───────── Duplicate prevention ───────── */

const recent = new Map<string, { at: number; reference: string }>();
const DEDUPE_MS = 10 * 60 * 1000;

export function fingerprint(parts: (string | null | undefined)[]) {
  return createHash("sha256").update(parts.map((p) => (p ?? "").toLowerCase().trim()).join("|")).digest("hex").slice(0, 32);
}

/** Returns the earlier reference if the same submission was received within 10 minutes. */
export function checkDuplicate(fp: string): string | null {
  const hit = recent.get(fp);
  if (hit && Date.now() - hit.at < DEDUPE_MS) return hit.reference;
  return null;
}

export function rememberSubmission(fp: string, reference: string) {
  recent.set(fp, { at: Date.now(), reference });
  if (recent.size > 5000) for (const [k, v] of recent) if (Date.now() - v.at > DEDUPE_MS) recent.delete(k);
}

export function hashIp(ip: string) {
  return createHash("sha256").update(`${ip}|${env.UNSUBSCRIBE_SECRET}`).digest("hex").slice(0, 16);
}
