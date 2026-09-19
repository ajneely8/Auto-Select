import { NextRequest, NextResponse } from "next/server";
import { recordEngagement, type TrafficSource } from "@/lib/pageviews/store";
import { getVehicleBySlug } from "@/lib/inventory/repository";

/** Known crawlers, uptime monitors, and script clients — kept out of the visitor count. */
const BOT_UA = /bot|spider|crawl|slurp|facebookexternalhit|pingdom|uptime|monitor|headless|curl|wget|python-requests|libwww|axios|go-http-client/i;

/** Hosts that mean the visit came from somewhere specific, rather than a plain referral. */
const SEARCH_HOSTS = /(^|\.)(google|bing|yahoo|duckduckgo|ecosia|brave)\./i;
const SOCIAL_HOSTS = /(^|\.)(facebook|instagram|twitter|x|t|tiktok|youtube|linkedin|pinterest|reddit)\.(com|co)/i;
const MARKETPLACE_HOSTS = /(^|\.)(cars|autotrader|cargurus|carsdirect|truecar|carfax|edmunds|offerup|craigslist)\./i;

function classifySource(referrer: string, utmMedium: string, utmSource: string, host: string): TrafficSource {
  const medium = utmMedium.toLowerCase();
  if (/cpc|ppc|paid|cpm|display/.test(medium)) return "paid";
  if (/email|newsletter/.test(medium)) return "email";
  if (/social/.test(medium)) return "social";
  if (MARKETPLACE_HOSTS.test(utmSource)) return "marketplace";

  if (!referrer) return "direct";
  let refHost = "";
  try {
    refHost = new URL(referrer).hostname;
  } catch {
    return "direct";
  }
  // Same-site navigation isn't a new traffic source.
  if (refHost && host && refHost.replace(/^www\./, "") === host.replace(/^www\./, "")) return "direct";
  if (MARKETPLACE_HOSTS.test(refHost)) return "marketplace";
  if (SEARCH_HOSTS.test(refHost)) return "organic";
  if (SOCIAL_HOSTS.test(refHost)) return "social";
  return refHost ? "referral" : "direct";
}

/**
 * Short-lived in-process guard so one visitor repeatedly clicking the same listing doesn't
 * inflate its click count. The client throttles too; this is the backstop. Resets on redeploy,
 * which is fine — it only needs to cover a browsing session.
 */
const CLICK_WINDOW_MS = 30 * 60 * 1000;
const recentClicks = new Map<string, number>();
function isRepeatClick(key: string): boolean {
  const now = Date.now();
  if (recentClicks.size > 5000) {
    for (const [k, t] of recentClicks) if (now - t > CLICK_WINDOW_MS) recentClicks.delete(k);
  }
  const last = recentClicks.get(key);
  if (last && now - last < CLICK_WINDOW_MS) return true;
  recentClicks.set(key, now);
  return false;
}

/**
 * First-party engagement beacon, called by PageviewBeacon. No cookies, no IP or user-agent
 * stored — just counts, plus a short random per-browser id used only to deduplicate visitors.
 */
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (BOT_UA.test(ua)) return new NextResponse(null, { status: 204 });

    const body = (await req.json().catch(() => null)) as {
      path?: string;
      kind?: string;
      stock?: string;
      vid?: string;
      ref?: string;
      utmMedium?: string;
      utmSource?: string;
    } | null;
    if (!body) return new NextResponse(null, { status: 204 });

    const kind = body.kind === "click" ? "click" : "view";
    const visitorId = String(body.vid ?? "").replace(/[^a-z0-9]/gi, "").slice(0, 24);
    const rawPath = typeof body.path === "string" ? body.path : "/";
    const pathname = (rawPath.split("?")[0].split("#")[0] || "/").slice(0, 200);

    // Resolve the listing to a stock number so engagement survives slug changes.
    let stock = typeof body.stock === "string" ? body.stock.replace(/[^a-z0-9-]/gi, "").slice(0, 40) : "";
    if (!stock && kind === "view") {
      const slug = pathname.match(/^\/inventory\/([a-z0-9-]+)$/)?.[1];
      if (slug) stock = (await getVehicleBySlug(slug))?.stockNumber ?? "";
    }

    if (kind === "click") {
      if (!stock) return new NextResponse(null, { status: 204 });
      if (isRepeatClick(`${visitorId || "anon"}:${stock}`)) return new NextResponse(null, { status: 204 });
      await recordEngagement({ kind, stock, visitorId });
      return new NextResponse(null, { status: 204 });
    }

    const source = classifySource(String(body.ref ?? ""), String(body.utmMedium ?? ""), String(body.utmSource ?? ""), req.headers.get("host") ?? "");
    await recordEngagement({ kind, pathname, stock: stock || null, visitorId, source });
  } catch {
    // Engagement tracking must never surface an error to the visitor.
  }
  return new NextResponse(null, { status: 204 });
}
