import { authorizeCron, unauthorized } from "@/lib/cron-auth";
import { readSubscriptions, writeSubscriptions, unsubscribeToken, FREQUENCY_MS, MAX_REMINDERS } from "@/lib/automation/subscriptions";
import { getPublishedVehicles } from "@/lib/inventory/repository";
import { applyFilters, parseFilters } from "@/lib/inventory/filters";
import { sendEmail } from "@/lib/integrations";
import { siteUrl } from "@/config/site";
import { business } from "@/config/business";
import { displayPrice, formatPrice, vehicleFullName } from "@/lib/format";

/**
 * GET /api/cron/reminders — consent-based follow-ups. Schedule daily (e.g. 9:00 AM Central).
 *  - search-alert: emails new vehicles that match a saved search (at most once per 72h).
 *  - vehicle-reminder: emails if a saved vehicle's price changed, or one gentle reminder (max 2 total, 72h apart).
 * Every email includes a one-click-to-confirm unsubscribe link. Sold vehicles are never promoted.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorizeCron(req)) return unauthorized();
  const subs = await readSubscriptions();
  const vehicles = await getPublishedVehicles();
  const now = Date.now();
  let sent = 0;

  for (const s of subs) {
    if (!s.active) continue;
    if (s.lastSentAt && now - new Date(s.lastSentAt).getTime() < FREQUENCY_MS) continue;
    const unsubscribe = `${siteUrl}/unsubscribe?email=${encodeURIComponent(s.email)}&token=${unsubscribeToken(s.email)}`;
    const footer = `\n\nYou're receiving this because you asked ${business.name} to email you about vehicles. Unsubscribe: ${unsubscribe}\n${business.name} · ${business.phone.display}`;

    if (s.kind === "search-alert") {
      const matches = applyFilters(vehicles, parseFilters(new URLSearchParams(s.query)));
      const fresh = matches.filter((v) => !s.knownVehicleIds.includes(v.id));
      // First run just records what already exists, so we only email genuinely new arrivals.
      if (!s.lastSentAt && s.sentCount === 0 && s.knownVehicleIds.length === 0) {
        s.knownVehicleIds = matches.map((v) => v.id);
        s.lastSentAt = new Date(0).toISOString();
        continue;
      }
      if (!fresh.length) continue;
      await sendEmail({
        to: s.email,
        subject: `${fresh.length} new ${fresh.length === 1 ? "vehicle matches" : "vehicles match"} your search — ${business.name}`,
        tags: ["alert", "search"],
        text: `New arrivals that match your saved search:\n\n${fresh.slice(0, 8).map((v) => `• ${vehicleFullName(v)} — ${formatPrice(displayPrice(v))}\n  ${siteUrl}/inventory/${v.slug}`).join("\n")}\n\nSee all matches: ${siteUrl}/inventory?${s.query}${footer}`,
      }).catch(() => {});
      s.knownVehicleIds = [...new Set([...s.knownVehicleIds, ...fresh.map((v) => v.id)])];
    } else {
      const v = vehicles.find((x) => x.id === s.vehicleId);
      if (!v) {
        s.active = false; // sold or unpublished — stop quietly
        continue;
      }
      const price = displayPrice(v);
      const priceChanged = s.lastKnownPrice != null && price != null && price !== s.lastKnownPrice;
      if (s.sentCount >= MAX_REMINDERS) {
        s.active = false; // hard cap per subscription
        continue;
      }
      if (!priceChanged && s.sentCount >= 1) continue; // at most one plain reminder; later emails only for price changes
      await sendEmail({
        to: s.email,
        subject: priceChanged ? `Price update: ${vehicleFullName(v)}` : `Still thinking about the ${vehicleFullName(v)}?`,
        tags: ["alert", "vehicle"],
        text: `${priceChanged ? `The price of the ${vehicleFullName(v)} changed from ${formatPrice(s.lastKnownPrice)} to ${formatPrice(price)}.` : `The ${vehicleFullName(v)} you saved is still listed at ${formatPrice(price)}.`}\n\nView it: ${siteUrl}/inventory/${v.slug}\nQuestions? Call ${business.phone.display}.${footer}`,
      }).catch(() => {});
      s.lastKnownPrice = price;
    }
    s.sentCount++;
    s.lastSentAt = new Date().toISOString();
    sent++;
  }
  await writeSubscriptions(subs);
  return Response.json({ checked: subs.length, sent });
}
