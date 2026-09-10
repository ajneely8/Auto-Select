import "server-only";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/config/env";

/**
 * Authentication for the internal CRM (/crm). One admin account, configured entirely through
 * environment variables — no accounts table, no third-party auth provider. Deliberately fails
 * closed: if CRM_ADMIN_EMAIL / CRM_ADMIN_PASSWORD_HASH / CRM_SESSION_SECRET aren't all set,
 * login is refused outright rather than falling back to an open or default state.
 *
 * Password hashing: scrypt (Node's built-in, no dependency). Generate a hash with:
 *   npm run crm:create-user -- you@example.com "your password"
 *
 * Session: a signed, httpOnly, short-lived cookie (HMAC-SHA256 over email + expiry). Not a JWT
 * library on purpose — this is the smallest thing that is still correct and dependency-free.
 */

const COOKIE_NAME = "as_crm_session";
const SESSION_HOURS = 12;

export function isCrmConfigured() {
  return !!(env.CRM_ADMIN_EMAIL && env.CRM_ADMIN_PASSWORD_HASH && env.CRM_SESSION_SECRET);
}

/** "scryptN:salt:hash", all hex — the format `crm:create-user` writes and this file reads. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `1:${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "1") return false;
  try {
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    const actual = scryptSync(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function sign(payload: string) {
  return createHmac("sha256", env.CRM_SESSION_SECRET!).update(payload).digest("base64url");
}

function makeToken(email: string) {
  const payload = `${email}.${Date.now() + SESSION_HOURS * 60 * 60 * 1000}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

function verifyToken(token: string): { email: string } | null {
  if (!env.CRM_SESSION_SECRET) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [email, expiresAt] = payload.split(".");
  if (!email || Date.now() > Number(expiresAt)) return null;
  return { email };
}

/** Checks credentials against the configured admin account. Always fails if the CRM isn't configured. */
export function checkCredentials(email: string, password: string): boolean {
  if (!isCrmConfigured()) return false;
  const emailOk = email.trim().toLowerCase() === env.CRM_ADMIN_EMAIL!.toLowerCase();
  // Always run the (comparatively expensive, constant-time) password check, even when the email
  // is already wrong, so a mismatched email doesn't respond measurably faster than a wrong password.
  const passOk = verifyPassword(password, env.CRM_ADMIN_PASSWORD_HASH!);
  return emailOk && passOk;
}

export async function createSession(email: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, makeToken(email), {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/crm",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete({ name: COOKIE_NAME, path: "/crm" });
}

/** The logged-in admin's email, or null if there's no valid session. Safe to call anywhere server-side. */
export async function getSession(): Promise<{ email: string } | null> {
  if (!isCrmConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
