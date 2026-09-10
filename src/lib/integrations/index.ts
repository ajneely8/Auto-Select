import "server-only";
import { createHmac } from "node:crypto";
import { env } from "@/config/env";
import { business } from "@/config/business";
import { enqueueRetry } from "./retry-queue";

/**
 * Provider-neutral integration adapters.
 *
 * Each adapter POSTs a signed JSON payload to a webhook you control (Zapier, Make, n8n, a CRM's inbound
 * webhook, or your own function that calls Resend/Postmark/Twilio/etc.). Unconfigured adapters run in
 * "log only" mode so development never sends real messages.
 *
 * Signature: header `X-AutoSelect-Signature: sha256=<hex>` = HMAC-SHA256(body, WEBHOOK_SIGNING_SECRET).
 */

export type IntegrationName = "email" | "sms" | "crm" | "scheduling";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** Free-form tags a provider can use for routing (never contains PII). */
  tags?: string[];
}

export interface SmsMessage {
  to: string;
  body: string;
}

export function sign(body: string) {
  return env.WEBHOOK_SIGNING_SECRET ? `sha256=${createHmac("sha256", env.WEBHOOK_SIGNING_SECRET).update(body).digest("hex")}` : "";
}

export async function postWebhook(integration: IntegrationName, url: string, payload: unknown, { retry = true } = {}) {
  const body = JSON.stringify(payload);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AutoSelect-Signature": sign(body), "X-AutoSelect-Integration": integration },
      body,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${integration} webhook responded ${res.status}`);
    return res;
  } catch (err) {
    console.error(`[integrations] ${integration} failed:`, err);
    if (retry) await enqueueRetry({ integration, url, payload, error: String(err) });
    throw err;
  }
}

export async function sendEmail(msg: EmailMessage) {
  const payload = { from: env.EMAIL_FROM || `${business.name} <${business.email}>`, ...msg };
  if (!env.EMAIL_WEBHOOK_URL) {
    console.info(`[email:log-only] to=${msg.to} subject="${msg.subject}"`);
    return { delivered: false, mode: "log-only" as const };
  }
  await postWebhook("email", env.EMAIL_WEBHOOK_URL, payload);
  return { delivered: true, mode: "webhook" as const };
}

/** SMS is only ever sent after explicit, unchecked-by-default consent. */
export async function sendSms(msg: SmsMessage, consent: boolean) {
  if (!consent) return { delivered: false, mode: "no-consent" as const };
  const body = `${msg.body} Msg & data rates may apply. Reply STOP to opt out, HELP for help.`;
  if (!env.SMS_WEBHOOK_URL) {
    console.info(`[sms:log-only] to=${msg.to.slice(0, -4)}**** chars=${body.length}`);
    return { delivered: false, mode: "log-only" as const };
  }
  await postWebhook("sms", env.SMS_WEBHOOK_URL, { ...msg, body });
  return { delivered: true, mode: "webhook" as const };
}

export async function pushToCrm(payload: unknown) {
  if (!env.CRM_WEBHOOK_URL) {
    console.info("[crm:log-only] lead captured");
    return { delivered: false, mode: "log-only" as const };
  }
  await postWebhook("crm", env.CRM_WEBHOOK_URL, payload);
  return { delivered: true, mode: "webhook" as const };
}
