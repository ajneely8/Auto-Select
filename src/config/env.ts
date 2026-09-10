import "server-only";
import { z } from "zod";

/**
 * Server environment. Everything is optional so the site runs out of the box;
 * integrations simply stay in "log only" mode until configured. See .env.example.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Inventory
  INVENTORY_SOURCE: z.enum(["local", "feed"]).default("local"),
  INVENTORY_FEED_URL: z.string().url().optional(),
  INVENTORY_FEED_TOKEN: z.string().optional(),
  INVENTORY_REVALIDATE_SECONDS: z.coerce.number().int().positive().default(900),

  // Lead storage + notifications
  LEAD_STORE: z.enum(["file", "none"]).default("file"),
  LEAD_DATA_DIR: z.string().default(".data"),
  LEAD_NOTIFY_EMAIL: z.string().email().optional(),
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
});

export const env = schema.parse(process.env);
