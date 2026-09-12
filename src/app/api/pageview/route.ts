import { NextRequest, NextResponse } from "next/server";
import { recordPageview } from "@/lib/pageviews/store";

/** Known crawlers, uptime monitors, and script clients — kept out of the visitor count. */
const BOT_UA = /bot|spider|crawl|slurp|facebookexternalhit|pingdom|uptime|monitor|headless|curl|wget|python-requests|libwww|axios|go-http-client/i;

/**
 * First-party pageview beacon, called by PageviewBeacon on every route change. No cookies, no
 * IP or user-agent stored — just an increment against today's date and the visited path.
 */
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (!BOT_UA.test(ua)) {
      const body = await req.json().catch(() => null);
      const rawPath = typeof body?.path === "string" ? body.path : "/";
      const pathname = (rawPath.split("?")[0].split("#")[0] || "/").slice(0, 200);
      await recordPageview(pathname);
    }
  } catch {
    // Pageview tracking must never surface an error to the visitor.
  }
  return new NextResponse(null, { status: 204 });
}
