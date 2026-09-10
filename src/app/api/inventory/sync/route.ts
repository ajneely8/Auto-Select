import { revalidatePath, revalidateTag } from "next/cache";
import { authorizeCron, unauthorized } from "@/lib/cron-auth";
import { getAllVehicles } from "@/lib/inventory/repository";
import { inventoryHealth } from "@/lib/inventory/health";

/**
 * POST/GET /api/inventory/sync — scheduled stock synchronization.
 * Call from a cron job (every 15–60 min) or from your inventory system's "inventory changed" webhook.
 * Refetches the feed (INVENTORY_SOURCE=feed), refreshes every page + the sitemap, and returns quality warnings.
 * Sold vehicles are unpublished automatically; price/mileage/photo changes appear on the next render.
 */
export const dynamic = "force-dynamic";

async function sync(req: Request) {
  if (!authorizeCron(req)) return unauthorized();
  revalidateTag("inventory", { expire: 0 });
  revalidatePath("/", "layout");
  const vehicles = await getAllVehicles();
  const warnings = inventoryHealth(vehicles);
  return Response.json({
    syncedAt: new Date().toISOString(),
    total: vehicles.length,
    published: vehicles.filter((v) => v.status !== "sold").length,
    sold: vehicles.filter((v) => v.status === "sold").length,
    warnings,
  });
}

export const GET = sync;
export const POST = sync;
