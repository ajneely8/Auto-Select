import "server-only";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/config/env";

/** Protects cron/webhook routes. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically. */
export function authorizeCron(req: Request): boolean {
  if (!env.CRON_SECRET) return env.NODE_ENV !== "production"; // open in dev, closed in prod until configured
  const given = Buffer.from((req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, ""));
  const expected = Buffer.from(env.CRON_SECRET);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });
