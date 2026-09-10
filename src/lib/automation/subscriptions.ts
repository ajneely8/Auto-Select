import "server-only";
import { dataDir } from "@/lib/data-dir";
import { createHmac, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "@/config/env";

/**
 * Consent-based follow-up automations:
 *  - Inventory alerts: email when new vehicles match a saved search, or a saved vehicle's price changes.
 *  - Saved-vehicle reminder: one gentle reminder about a vehicle the shopper asked us to remind them about.
 *
 * Guardrails: explicit opt-in only (never pre-checked), unsubscribe link in every email,
 * at most one email per subscription every 72 hours, one plain reminder per saved vehicle, 3 emails max.
 */
export interface Subscription {
  id: string;
  email: string;
  kind: "search-alert" | "vehicle-reminder";
  query: string;
  vehicleId: string | null;
  createdAt: string;
  lastSentAt: string | null;
  sentCount: number;
  knownVehicleIds: string[];
  lastKnownPrice: number | null;
  active: boolean;
}

export const FREQUENCY_MS = 72 * 60 * 60 * 1000;
export const MAX_REMINDERS = 3; // total emails per vehicle subscription (1 reminder + price updates)

const file = () => dataDir("subscriptions.json");

export async function readSubscriptions(): Promise<Subscription[]> {
  try {
    return JSON.parse(await fs.readFile(file(), "utf8")) as Subscription[];
  } catch {
    return [];
  }
}

export async function writeSubscriptions(subs: Subscription[]) {
  await fs.mkdir(path.dirname(file()), { recursive: true });
  await fs.writeFile(file(), JSON.stringify(subs, null, 2), { mode: 0o600 });
}

export async function addSubscription(input: Omit<Subscription, "id" | "createdAt" | "lastSentAt" | "sentCount" | "active">) {
  const subs = await readSubscriptions();
  const dupe = subs.find((s) => s.active && s.email === input.email && s.kind === input.kind && s.query === input.query && s.vehicleId === input.vehicleId);
  if (dupe) return dupe;
  const sub: Subscription = {
    ...input,
    id: `sub_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    lastSentAt: null,
    sentCount: 0,
    active: true,
  };
  subs.push(sub);
  await writeSubscriptions(subs);
  return sub;
}

/* ───────── Unsubscribe tokens (HMAC, no database lookup needed to verify) ───────── */

const DEV_SECRET = "dev-only-change-me";
/** In production the default secret would let anyone forge unsubscribe links, so verification is refused until it's set. */
const secretIsUnsafe = () => env.NODE_ENV === "production" && env.UNSUBSCRIBE_SECRET === DEV_SECRET;

export function unsubscribeToken(email: string) {
  if (secretIsUnsafe()) console.error("[subscriptions] UNSUBSCRIBE_SECRET is not set in production — unsubscribe links will not verify. Set it in your hosting environment.");
  return createHmac("sha256", env.UNSUBSCRIBE_SECRET).update(email.toLowerCase()).digest("base64url").slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string) {
  if (secretIsUnsafe()) return false;
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function unsubscribeEmail(email: string) {
  const subs = await readSubscriptions();
  let n = 0;
  for (const s of subs) if (s.email === email.toLowerCase() && s.active) {
    s.active = false;
    n++;
  }
  await writeSubscriptions(subs);
  return n;
}
