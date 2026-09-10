import { NextResponse, type NextRequest } from "next/server";
import { getPublishedVehicles } from "@/lib/inventory/repository";
import { toSummary } from "@/lib/inventory/summary";
import { showDemo360 } from "@/config/site";

/**
 * GET /api/vehicles?ids=a,b,c → vehicle summaries for client tools (compare tray, saved, recently viewed).
 * Only published vehicles are returned; unknown or sold IDs are silently dropped.
 */
export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 24);
  const all = await getPublishedVehicles();
  const byId = new Map(all.map((v) => [v.id, v]));
  const vehicles = ids
    .map((id) => byId.get(id))
    .filter((v) => v != null)
    .map((v) => {
      const s = toSummary(v);
      if (v.exterior360IsDemo && !showDemo360) s.has360 = false;
      return s;
    });
  return NextResponse.json({ vehicles }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
