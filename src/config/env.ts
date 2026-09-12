import "server-only";
import { z } from "zod";

/**
 * Server environment. Everything is optional so the site runs out of the box;
 * integrations simply stay in "log only" mode until configured. See .env.example.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Inventory
  // "local": data/inventory.json, baked in at build time. "feed": fetch INVENTORY_FEED_URL.
  // "file": read INVENTORY_FILE_PATH from disk fresh on every request — for a local process (like
  // scripts/sync-dealercenter-inventory.mjs) that writes inventory JSON outside the git tree, no
  // rebuild needed to pick up changes.
  INVENTORY_SOURCE: z.enum(["local", "feed", "file"]).default("local"),
  INVENTORY_FEED_URL: z.string().url().optional(),
  INVENTORY_FEED_TOKEN: z.string().optional(),
  INVENTORY_REVALIDATE_SECONDS: z.coerce.number().int().positive().default(900),
  INVENTORY_FILE_PATH: z.string().default(".data/dealercenter-inventory.json"),

  // Lead storage + notifications
  // "file" writes to LEAD_DATA_DIR (VPS/local — not durable on serverless). "none" doesn't persist
  // locally at all (rely on CRM_WEBHOOK_URL). "netlify-blobs" persists via Netlify's built-in Blobs
  // store — the durable option when the site is deployed on Netlify.
  LEAD_STORE: z.enum(["file", "none", "netlify-blobs"]).default("file"),
  LEAD_DATA_DIR: z.string().default(".data"),
  // Comma-separated list of addresses to notify on a new lead, e.g. "a@x.com, b@y.com".
  LEAD_NOTIFY_EMAIL: z.string().optional(),
  // When set, sendEmail() delivers via the Resend API directly instead of EMAIL_WEBHOOK_URL.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_WEBHOOK_URL: z.string().url().optional(),
  EMAIL_FROM: z.string().optional(),
  SMS_WEBHOOK_URL: z.string().url().optional(),
  CRM_WEBHOOK_URL: z.string().url().optional(),
  WEBHOOK_SIGNING_SECRET: z.string().optional(),

  // Scheduling provider (webhook that returns { confirmed: boolean, reference?: string })
  SCHEDULING_WEBHOOK_URL: z.string().url().optional(),

  // Security
  CRON_SECRET: z.string().optional(),
  UNSUBSCRIBE_SECRET: z.string().default("dev-only-change-me"),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Inventory assistant
  ANTHROPIC_API_KEY: z.string().optional(),
  ASSISTANT_MODEL: z.string().default("claude-opus-5"),
  ASSISTANT_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),

  // Internal CRM (/crm) — a private, login-gated dashboard over the lead store. Unset = login always
  // fails (fail closed). Generate a hash with `npm run crm:create-user`.
  CRM_ADMIN_EMAIL: z.string().email().optional(),
  CRM_ADMIN_PASSWORD_HASH: z.string().optional(),
  CRM_SESSION_SECRET: z.string().optional(),

  // DealerCenter (or any DMS/CRM that accepts ADF-over-SFTP leads). Unset = disabled, leads only go
  // to the site's own CRM/email/SMS. Get these from DealerCenter's Lead Management settings
  // ("SFTP to Lead") or their support team — they're unique per dealership.
  DEALERCENTER_SFTP_HOST: z.string().optional(),
  DEALERCENTER_SFTP_PORT: z.coerce.number().int().positive().default(22),
  DEALERCENTER_SFTP_USERNAME: z.string().optional(),
  DEALERCENTER_SFTP_PASSWORD: z.string().optional(),
  DEALERCENTER_SFTP_PATH: z.string().default("/"),
});

export const env = schema.parse(process.env);
