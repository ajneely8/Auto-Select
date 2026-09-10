import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { env } from "@/config/env";
import { sendEmail, sendSms } from "@/lib/integrations";
import { business } from "@/config/business";
import { formatDateLong, formatSlot } from "@/lib/scheduling/hours";

/**
 * POST /api/webhooks/scheduling — called by your scheduling provider/CRM when staff confirm, reschedule,
 * or cancel an appointment request. Only here does a customer get told an appointment is CONFIRMED.
 * Signed with HMAC-SHA256 (X-AutoSelect-Signature: sha256=<hex>) using WEBHOOK_SIGNING_SECRET.
 */
export const dynamic = "force-dynamic";

const schema = z.object({
  leadId: z.string().max(40),
  status: z.enum(["confirmed", "rescheduled", "cancelled"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customer: z.object({ firstName: z.string().max(60), email: z.string().email(), phone: z.string().max(20).optional(), smsConsent: z.boolean().optional() }),
});

function verify(body: string, signature: string | null) {
  if (!env.WEBHOOK_SIGNING_SECRET) return env.NODE_ENV !== "production";
  const expected = Buffer.from(`sha256=${createHmac("sha256", env.WEBHOOK_SIGNING_SECRET).update(body).digest("hex")}`);
  const given = Buffer.from(signature ?? "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function POST(req: Request) {
  const body = await req.text();
  if (!verify(body, req.headers.get("x-autoselect-signature"))) return Response.json({ error: "Invalid signature" }, { status: 401 });
  const parsed = schema.safeParse(JSON.parse(body || "null"));
  if (!parsed.success) return Response.json({ error: "Invalid payload" }, { status: 400 });
  const { status, date, time, customer, leadId } = parsed.data;
  const when = `${formatDateLong(date)} at ${formatSlot(time)}`;
  const verb = status === "cancelled" ? "cancelled" : status === "rescheduled" ? "rescheduled to" : "confirmed for";

  await Promise.allSettled([
    sendEmail({
      to: customer.email,
      subject: `Your appointment is ${status} — ${business.name}`,
      tags: ["appointment", status],
      text: `Hi ${customer.firstName},\n\nYour appointment with ${business.name} is ${verb} ${status === "cancelled" ? "" : when}.\nReference: ${leadId}\n\n${business.address.street}, ${business.address.city}, ${business.address.region} ${business.address.postalCode}\nQuestions or changes? Call ${business.phone.display}.`,
    }),
    customer.phone ? sendSms({ to: customer.phone, body: `${business.name}: your appointment is ${verb} ${status === "cancelled" ? "" : when}.` }, !!customer.smsConsent) : Promise.resolve(),
  ]);
  return Response.json({ ok: true });
}
