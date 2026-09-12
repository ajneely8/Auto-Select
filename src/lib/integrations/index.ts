import "server-only";
import { createHmac } from "node:crypto";
import { Resend } from "resend";
import { env } from "@/config/env";
import { business } from "@/config/business";
import { siteUrl } from "@/config/site";
import { enqueueRetry } from "./retry-queue";

/**
 * Provider-neutral integration adapters.
 *
 * Email sends directly through Resend when RESEND_API_KEY is set. Everything else (and email as a
 * fallback) POSTs a signed JSON payload to a webhook you control (Zapier, Make, n8n, a CRM's inbound
 * webhook, or your own function that calls Postmark/Twilio/etc.). Unconfigured adapters run in
 * "log only" mode so development never sends real messages.
 *
 * Signature: header `X-AutoSelect-Signature: sha256=<hex>` = HMAC-SHA256(body, WEBHOOK_SIGNING_SECRET).
 */

export type IntegrationName = "email" | "sms" | "crm" | "scheduling";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface EmailMessage {
  to: string | string[];
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

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Wraps a plain-text email body as simple HTML and appends the Auto Select logo as a footer. */
export function emailHtml(text: string) {
  const body = escapeHtml(text)
    .split("\n\n")
    .map((para) => `<p style="margin:0 0 12px;white-space:pre-line;">${para}</p>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#111827;max-width:560px;margin:0 auto;">
${body}
<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
<img src="${siteUrl}/brand-logo.png" alt="${business.name}" width="160" style="display:inline-block;width:160px;max-width:160px;height:auto;" />
</div>
</div>`;
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
  const from = env.EMAIL_FROM || `${business.name} <${business.email}>`;
  if (resend) {
    // One-to-one sends, even when there are several recipients: a single message with many
    // addresses in `To` reads as bulk/list mail to some providers (Yahoo in particular flagged
    // these as spam while the single-recipient customer confirmation landed fine), so each
    // recipient gets their own message instead.
    const recipients = Array.isArray(msg.to) ? msg.to : [msg.to];
    const results = await Promise.allSettled(
      recipients.map((to) => resend!.emails.send({ from, to, subject: msg.subject, text: msg.text, html: msg.html, replyTo: msg.replyTo })),
    );
    let ok = 0;
    for (const [i, r] of results.entries()) {
      if (r.status === "fulfilled" && !r.value.error) ok++;
      else console.error(`[email:resend] failed for ${recipients[i]}:`, r.status === "fulfilled" ? r.value.error : r.reason);
    }
    if (ok === 0) return { delivered: false, mode: "error" as const };
    return { delivered: true, mode: "resend" as const };
  }
  if (!env.EMAIL_WEBHOOK_URL) {
    console.info(`[email:log-only] to=${msg.to} subject="${msg.subject}"`);
    return { delivered: false, mode: "log-only" as const };
  }
  await postWebhook("email", env.EMAIL_WEBHOOK_URL, { from, ...msg });
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
