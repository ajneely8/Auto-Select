import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import { dataDir } from "@/lib/data-dir";
import { env } from "@/config/env";

/**
 * Reads one trade-in photo back out of whichever backend `LEAD_STORE` points at. `leadId` and
 * `file` are expected to already be validated against `/^[a-zA-Z0-9._-]+$/` by the caller (the
 * CRM photo route) — that alone rules out path traversal for both the filesystem and the Blobs key.
 */
export async function readLeadUpload(leadId: string, file: string): Promise<Buffer | null> {
  if (env.LEAD_STORE === "netlify-blobs") {
    const buf = await getStore({ name: "lead-uploads", consistency: "strong" }).get(`${leadId}/${file}`, { type: "arrayBuffer" });
    return buf ? Buffer.from(buf) : null;
  }

  const folder = path.join(dataDir(), "uploads", leadId);
  const target = path.join(folder, file);
  if (path.dirname(target) !== folder) return null;
  try {
    return await fs.readFile(target);
  } catch {
    return null;
  }
}
