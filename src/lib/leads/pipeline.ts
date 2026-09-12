import "server-only";
import { randomBytes } from "node:crypto";
import { business } from "@/config/business";
import { siteUrl } from "@/config/site";
import { env } from "@/config/env";
import type { Lead, LeadType, UtmData } from "@/lib/types";
import type { FormState } from "./form-state";
import { contactFields, typeSchemas, usesContactFields, emailOnlySchema, LEAD_LABELS, SENSITIVE_FIELDS } from "./schemas";
import { formDataToRecord, formatPhone, cleanLine } from "./sanitize";
import { looksLikeBot, verifyTurnstile, rateLimit, fingerprint, checkDuplicate, rememberSubmission } from "./spam";
import { leadStore } from "./store";
import { sendEmail, sendSms, pushToCrm, emailHtml } from "@/lib/integrations";
import { pushLeadToDealerCenter } from "@/lib/integrations/adf";
import { validateSlot, formatDateLong, formatSlot } from "@/lib/scheduling/hours";
import { scheduling } from "@/lib/scheduling/provider";
import { getVehicleById } from "@/lib/inventory/repository";
import { vehicleFullName, formatPrice } from "@/lib/format";
import { addSubscription, unsubscribeToken } from "@/lib/automation/subscriptions";
import type { z } from "zod";

const ALLOWED_UPLOAD = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_UPLOADS = 6;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function zodErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

const newLeadId = () => `AS-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;

export interface LeadContext {
  ip: string;
  userAgent: string;
}

/**
 * A submission that trips the honeypot/link-spam checks is still saved — as `status: "spam"`,
 * with no email/SMS/CRM notifications — rather than discarded outright. The visitor still sees a
 * generic "thanks" message either way, so nothing is tipped off, but a false positive is never
 * unrecoverable: it just sits under the Spam filter in the CRM instead of the main list, where
 * staff can find and restore it if it turns out to be legitimate.
 */
async function saveSpamLead(type: LeadType, raw: Record<string, string>, ctx: LeadContext, reason: string): Promise<void> {
  const lead: Lead = {
    id: newLeadId(),
    type,
    vehicleId: cleanLine(raw.vehicleId || raw.alertVehicleId, 40) || null,
    firstName: cleanLine(raw.firstName, 80),
    lastName: cleanLine(raw.lastName, 80),
    email: cleanLine(raw.email, 200),
    phone: cleanLine(raw.phone, 40),
    preferredContactMethod: "email",
    message: cleanLine(raw.message, 2000),
    marketingConsent: false,
    smsConsent: false,
    sourcePage: cleanLine(raw._sourcePage, 300).replace(/[?#].*$/, ""),
    referrer: cleanLine(raw._referrer, 300).replace(/[?#].*$/, ""),
    utmData: {},
    createdAt: new Date().toISOString(),
    status: "spam",
    details: { spamReason: reason, ip: ctx.ip },
  };
  await leadStore.save(lead);
}

/**
 * The lead pipeline. Every form in the site goes through here:
 *  1 validate + sanitize → 2 spam checks → 3 rate limit → 4 duplicate check → 5 build + categorize
 *  → 6 store → 7 integrations (internal email, customer email, optional SMS, CRM) with retry on failure.
 */
export async function processLead(type: LeadType, fd: FormData, ctx: LeadContext): Promise<FormState> {
  const raw = formDataToRecord(fd);

  // 2. Spam protection. Bots get a quiet "success" so they don't learn what tripped them — but the
  // submission is still saved as "spam" (see saveSpamLead) rather than thrown away.
  const bot = looksLikeBot(raw);
  if (bot) {
    console.warn(`[leads] flagged ${type} submission as spam (${bot}) — saved for review, no notifications sent`);
    await saveSpamLead(type, raw, ctx, bot).catch((err) => console.error("[leads] spam-lead storage failed:", err));
    return { status: "success", message: "Thanks — we received your request." };
  }
  if (!(await verifyTurnstile(raw["cf-turnstile-response"], ctx.ip))) {
    return { status: "error", message: "Please complete the verification check and try again." };
  }

  // 3. Rate limit: 6 submissions per IP per 10 minutes across all forms.
  const rl = rateLimit(`lead:${ctx.ip}`, 6, 10 * 60 * 1000);
  if (!rl.ok) return { status: "error", message: `You've sent several requests in a short time. Please wait ${Math.ceil(rl.retryAfterSec / 60)} minute(s) or call ${business.phone.display}.` };

  // 1. Validate.
  const base = usesContactFields(type) ? contactFields.safeParse(raw) : emailOnlySchema.safeParse(raw);
  const specific = typeSchemas[type].safeParse(raw);
  const fieldErrors = { ...(base.success ? {} : zodErrors(base.error)), ...(specific.success ? {} : zodErrors(specific.error)) };

  let appointmentCheck: ReturnType<typeof validateSlot> | null = null;
  if ((type === "test-drive" || type === "appointment") && specific.success) {
    const s = specific.data as { date: string; time: string };
    appointmentCheck = validateSlot(s.date, s.time);
    if (!appointmentCheck.ok) fieldErrors[appointmentCheck.field] = appointmentCheck.message;
  }

  // Trade-in photos: type + size + count checks.
  const files = type === "trade-in" ? fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0) : [];
  if (files.length > MAX_UPLOADS) fieldErrors.photos = `Please upload up to ${MAX_UPLOADS} photos.`;
  else if (files.some((f) => !ALLOWED_UPLOAD.has(f.type))) fieldErrors.photos = "Photos must be JPG, PNG, WebP, or HEIC images.";
  else if (files.some((f) => f.size > MAX_UPLOAD_BYTES)) fieldErrors.photos = "Each photo must be 8 MB or smaller.";

  if (!base.success || !specific.success || Object.keys(fieldErrors).length) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors };
  }

  const contact = base.data as Partial<z.infer<typeof contactFields>> & { email: string };
  const details = specific.data as Record<string, unknown>;
  const vehicleId = (details.vehicleId as string) || contact.vehicleId || (details.alertVehicleId as string) || null;
  const vehicle = vehicleId ? await getVehicleById(vehicleId) : null;

  // 4. Duplicate prevention (same person, same form, same vehicle, same message within 10 minutes).
  const fp = fingerprint([type, contact.email, contact.phone, vehicle?.id, contact.message, String(details.date ?? ""), String(details.time ?? "")]);
  const dupe = checkDuplicate(fp);
  if (dupe) return { status: "success", reference: dupe, message: "We already have this request — no need to send it again." };

  // 5. Build + categorize.
  const utm: UtmData = {
    source: cleanLine(raw.utm_source, 80) || undefined,
    medium: cleanLine(raw.utm_medium, 80) || undefined,
    campaign: cleanLine(raw.utm_campaign, 80) || undefined,
    term: cleanLine(raw.utm_term, 80) || undefined,
    content: cleanLine(raw.utm_content, 80) || undefined,
  };
  const lead: Lead = {
    id: newLeadId(),
    type,
    vehicleId: vehicle?.id ?? null,
    firstName: contact.firstName ?? "",
    lastName: contact.lastName ?? "",
    email: contact.email,
    phone: contact.phone ?? "",
    preferredContactMethod: contact.preferredContactMethod ?? "email",
    message: contact.message ?? "",
    marketingConsent: contact.marketingConsent ?? false,
    smsConsent: contact.smsConsent ?? false,
    sourcePage: cleanLine(raw._sourcePage, 300).replace(/[?#].*$/, ""),
    referrer: cleanLine(raw._referrer, 300).replace(/[?#].*$/, ""),
    utmData: utm,
    createdAt: new Date().toISOString(),
    status: "new",
    details: { ...details, ...(vehicle ? { vehicleLabel: vehicleFullName(vehicle), stockNumber: vehicle.stockNumber } : {}) },
  };

  // Appointment requests go to the scheduling provider. Confirmation only if the provider says so.
  let confirmed = false;
  if (type === "test-drive" || type === "appointment") {
    const d = details as { date: string; time: string; kind?: "test-drive" | "dealership-visit" | "phone-consultation" | "service" };
    const result = await scheduling.request({
      kind: type === "test-drive" ? "test-drive" : d.kind!,
      date: d.date,
      time: d.time,
      timezone: business.timezone,
      vehicleId: lead.vehicleId,
      leadId: lead.id,
      customer: { firstName: lead.firstName, lastName: lead.lastName, email: lead.email, phone: lead.phone },
    });
    confirmed = result.status === "confirmed";
    lead.details = { ...lead.details, appointmentStatus: result.status, providerReference: result.providerReference };
  }

  // 6. Store (and uploads).
  try {
    if (files.length) {
      const saved = await Promise.all(files.map((f) => leadStore.saveUpload(lead.id, f)));
      lead.details = { ...lead.details, photoFiles: saved };
    }
    await leadStore.save(lead);
  } catch (err) {
    console.error("[leads] storage failed — continuing to CRM/email so the lead is not lost:", err);
  }

  if (type === "inventory-alert") {
    await addSubscription({
      email: lead.email,
      kind: details.alertVehicleId ? "vehicle-reminder" : "search-alert",
      query: String(details.alertQuery ?? ""),
      vehicleId: lead.vehicleId,
      knownVehicleIds: [],
      lastKnownPrice: vehicle?.price ?? null,
    }).catch((err) => console.error("[leads] subscription save failed:", err));
  }

  // 7. Integrations — run in parallel; failures are queued for retry and never block the customer.
  const label = LEAD_LABELS[type];
  const vehicleLine = vehicle ? `${vehicleFullName(vehicle)} · Stock ${vehicle.stockNumber} · ${formatPrice(vehicle.price)}` : "No specific vehicle";
  const safeDetails = Object.entries(details)
    .filter(([k, v]) => v !== "" && v != null && !SENSITIVE_FIELDS.has(k) && !["vehicleId", "alertConsent", "contactConsent"].includes(k))
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join("\n");
  const when =
    type === "test-drive" || type === "appointment"
      ? `${formatDateLong(String(details.date))} at ${formatSlot(String(details.time))} (${confirmed ? "confirmed" : "requested — not yet confirmed"})`
      : null;

  const internalText = [
    `${label} · ${lead.id}`,
    `Name: ${lead.firstName} ${lead.lastName}`.trim(),
    `Phone: ${lead.phone ? formatPhone(lead.phone) : "—"} · Email: ${lead.email}`,
    `Prefers: ${lead.preferredContactMethod}${lead.smsConsent ? " · SMS consent: yes" : ""}`,
    `Vehicle: ${vehicleLine}`,
    when ? `When: ${when}` : "",
    lead.message ? `Message: ${lead.message}` : "",
    safeDetails ? `\nDetails:\n${safeDetails}` : "",
    SENSITIVE_FIELDS.size && Object.keys(details).some((k) => SENSITIVE_FIELDS.has(k) && details[k]) ? "\nFinancial/VIN details were provided — view them in the CRM or lead store." : "",
    `\nPage: ${lead.sourcePage || "—"} · Referrer: ${lead.referrer || "—"}${utm.source ? ` · UTM: ${utm.source}/${utm.medium ?? ""}/${utm.campaign ?? ""}` : ""}`,
  ]
    .filter(Boolean)
    .join("\n");

  const internal = {
    to: env.LEAD_NOTIFY_EMAIL
      ? env.LEAD_NOTIFY_EMAIL.split(",").map((e) => e.trim()).filter(Boolean)
      : business.email,
    subject: `New ${label}${vehicle ? ` — ${vehicleFullName(vehicle)}` : ""} (${lead.id})`,
    replyTo: lead.email,
    tags: ["lead", type],
    text: internalText,
    html: emailHtml(internalText),
  };

  const unsubscribe = `${siteUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}&token=${unsubscribeToken(lead.email)}`;
  const friendly: Record<LeadType, string> = {
    contact: "message",
    availability: "availability request",
    "test-drive": "test-drive request",
    appointment: "appointment request",
    financing: "financing question",
    "trade-in": "trade-in details",
    "vehicle-locator": "vehicle request",
    delivery: "delivery request",
    service: "service request",
    "service-contract": "service-contract quote request",
    "inventory-alert": "inventory alert",
  };
  const customerText = [
    `Hi ${lead.firstName || "there"},`,
    "",
    `Thanks for contacting ${business.name}. We received your ${friendly[type]}${vehicle ? ` for the ${vehicleFullName(vehicle)}` : ""}.`,
    when ? `Requested time: ${when}. ${confirmed ? "" : "A team member will contact you to confirm it."}` : "",
    type === "trade-in" ? "Online estimates are preliminary and subject to a physical inspection." : "",
    `A team member will follow up during business hours (${business.hoursSummary.map((h) => `${h.label} ${h.value}`).join("; ")}).`,
    `Reference: ${lead.id}`,
    "",
    `Questions? Call ${business.phone.display} or reply to this email.`,
    `${business.name} · ${business.address.street}, ${business.address.city}, ${business.address.region} ${business.address.postalCode}`,
    type === "inventory-alert" ? `\nUnsubscribe anytime: ${unsubscribe}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  const customer = {
    to: lead.email,
    subject: `We received your ${friendly[type]} — ${business.name}`,
    tags: ["confirmation", type],
    text: customerText,
    html: emailHtml(customerText),
  };

  await Promise.allSettled([
    sendEmail(internal),
    sendEmail(customer),
    lead.phone && lead.smsConsent
      ? sendSms({ to: lead.phone, body: `${business.name}: we received your ${label.toLowerCase()} (ref ${lead.id}). We'll be in touch during business hours.` }, lead.smsConsent)
      : Promise.resolve(),
    pushToCrm({ event: "lead.created", lead }),
    pushLeadToDealerCenter(lead, vehicle),
  ]);

  rememberSubmission(fp, lead.id);

  const successMessage: Partial<Record<LeadType, string>> = {
    "test-drive": confirmed
      ? "Your test drive is confirmed. We sent the details to your email."
      : "Your test-drive request is in. It is not confirmed yet — a team member will contact you shortly to confirm the time.",
    appointment: confirmed
      ? "Your appointment is confirmed. We sent the details to your email."
      : "Your appointment request is in. It is not confirmed yet — we'll contact you to confirm the time.",
    "trade-in": "Thanks — we received your trade-in details. We'll follow up with a preliminary estimate. Final value depends on an in-person inspection.",
    "vehicle-locator": "Thanks — your vehicle request is in. We'll start searching and follow up with options.",
    "inventory-alert": "You're subscribed. We'll email you when matching vehicles arrive. You can unsubscribe anytime.",
  };

  return {
    status: "success",
    reference: lead.id,
    confirmed,
    message: successMessage[type] ?? "Thanks — we received your message and will follow up during business hours.",
  };
}
