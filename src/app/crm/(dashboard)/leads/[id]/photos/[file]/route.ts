import path from "node:path";
import { getSession } from "@/lib/crm/auth";
import { readLeadUpload } from "@/lib/leads/read-upload";

/**
 * Serves one trade-in photo to a logged-in CRM user. Route Handlers aren't covered by the
 * `(dashboard)` layout's auth guard (that only wraps rendered pages), so this checks the session
 * itself. The `id`/`file` regex below is what actually keeps a crafted value from reading outside
 * that one lead's own photos — on the file backend it also rules out path traversal, and on the
 * Netlify Blobs backend there's no path to traverse at all.
 */
const CONTENT_TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", heif: "image/heif" };

export async function GET(_req: Request, { params }: RouteContext<"/crm/leads/[id]/photos/[file]">) {
  const session = await getSession();
  if (!session) return new Response("Not found", { status: 404 });

  const { id, file } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(id) || !/^[a-zA-Z0-9._-]+$/.test(file)) return new Response("Not found", { status: 404 });

  const ext = path.extname(file).slice(1).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new Response("Not found", { status: 404 });

  const buf = await readLeadUpload(id, file);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": contentType, "Cache-Control": "private, no-store" } });
}
