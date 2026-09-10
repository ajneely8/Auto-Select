import { promises as fs } from "node:fs";
import path from "node:path";
import { getSession } from "@/lib/crm/auth";
import { dataDir } from "@/lib/data-dir";

/**
 * Serves one trade-in photo to a logged-in CRM user. Route Handlers aren't covered by the
 * `(dashboard)` layout's auth guard (that only wraps rendered pages), so this checks the session
 * itself. Also re-derives the lead's upload folder rather than trusting any path segment straight
 * from the URL, so a crafted `file` value can't read outside that one lead's own upload folder.
 */
const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", heif: "image/heif" };

export async function GET(_req: Request, { params }: RouteContext<"/crm/leads/[id]/photos/[file]">) {
  const session = await getSession();
  if (!session) return new Response("Not found", { status: 404 });

  const { id, file } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(id) || !/^[a-zA-Z0-9._-]+$/.test(file)) return new Response("Not found", { status: 404 });

  const folder = path.join(dataDir(), "uploads", id);
  const target = path.join(folder, file);
  if (path.dirname(target) !== folder) return new Response("Not found", { status: 404 });

  const ext = path.extname(file).slice(1).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new Response("Not found", { status: 404 });

  try {
    const buf = await fs.readFile(target);
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
