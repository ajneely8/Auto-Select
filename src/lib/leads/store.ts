import "server-only";
import { dataDir } from "@/lib/data-dir";
import { promises as fs } from "node:fs";
import path from "node:path";
import { env } from "@/config/env";
import type { Lead } from "@/lib/types";

/**
 * Lead storage adapter.
 *  - "file": appends to <LEAD_DATA_DIR>/leads.ndjson (local/VPS hosting). The directory is git-ignored.
 *  - "none": do not persist locally; rely on the CRM webhook (recommended on serverless hosts).
 * Implement `LeadStore` against Postgres/Supabase/Airtable to use a database instead.
 */
export interface LeadStore {
  save(lead: Lead): Promise<void>;
  saveUpload(leadId: string, file: File): Promise<string>;
}

const fileStore: LeadStore = {
  async save(lead) {
    await fs.mkdir(dataDir(), { recursive: true });
    await fs.appendFile(path.join(dataDir(), "leads.ndjson"), JSON.stringify(lead) + "\n", { mode: 0o600 });
  },
  async saveUpload(leadId, file) {
    const safe = file.name.replace(/[^a-z0-9._-]/gi, "_").slice(-80) || "photo.jpg";
    const folder = path.join(dataDir(), "uploads", leadId);
    await fs.mkdir(folder, { recursive: true });
    const dest = path.join(folder, `${Date.now()}-${safe}`);
    await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
    return path.relative(dataDir(), dest);
  },
};

const noStore: LeadStore = {
  async save() {},
  async saveUpload(_id, file) {
    return `not-stored:${file.name}`;
  },
};

export const leadStore: LeadStore = env.LEAD_STORE === "none" ? noStore : fileStore;
