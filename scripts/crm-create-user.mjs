#!/usr/bin/env node
/**
 * Generates the two environment variables needed to log into the internal CRM (/crm):
 *
 *   npm run crm:create-user -- you@example.com "a strong password"
 *
 * Prints CRM_ADMIN_EMAIL and CRM_ADMIN_PASSWORD_HASH — put them (plus a CRM_SESSION_SECRET,
 * e.g. `openssl rand -hex 32`) in .env.local for development or your host's environment
 * variables for production. Never commit real values to the repository.
 */
import { randomBytes, scryptSync } from "node:crypto";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run crm:create-user -- you@example.com "a strong password"');
  process.exit(1);
}
if (password.length < 12) {
  console.error("Please use a password with at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const encoded = `1:${salt.toString("hex")}:${hash.toString("hex")}`;

console.log(`CRM_ADMIN_EMAIL=${email}`);
console.log(`CRM_ADMIN_PASSWORD_HASH=${encoded}`);
console.log(`# Also set CRM_SESSION_SECRET to a random value, e.g.: openssl rand -hex 32`);
