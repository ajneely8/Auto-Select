import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDir } from "@/lib/data-dir";
import type { Lead, LeadStatus } from "@/lib/types";

/**
 * Read side of the lead store, for the internal CRM. The write side (`save`) lives in
 * src/lib/leads/store.ts; this file adds listing and status updates on top of the same
 * `leads.ndjson` file so there's exactly one place that knows the on-disk format.
 *
 * File-based and fine for a single small-business instance. Rewriting the whole file on a status
 * change (rather than a database UPDATE) is deliberate and simple — see the durability note in
 * docs/CRM.md if you outgrow it or move to serverless hosting.
 */
const FILE = () => path.join(dataDir(), "leads.ndjson");

export async function listLeads(): Promise<Lead[]> {
  let raw: string;
  try {
    raw = await fs.readFile(FILE(), "utf8");
  } catch {
    return [];
  }
  const leads: Lead[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      leads.push(JSON.parse(line) as Lead);
    } catch {
      // Skip a corrupted line rather than fail the whole dashboard.
    }
  }
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLead(id: string): Promise<Lead | null> {
  const leads = await listLeads();
  return leads.find((l) => l.id === id) ?? null;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  const leads = await listLeads();
  const target = leads.find((l) => l.id === id);
  if (!target) return false;
  target.status = status;
  // Rewritten oldest-first so the file's natural order stays append-like on disk.
  const body = leads
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((l) => JSON.stringify(l))
    .join("\n");
  await fs.writeFile(FILE(), body + (body ? "\n" : ""), { mode: 0o600 });
  return true;
}

export interface LeadCounts {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byType: Partial<Record<Lead["type"], number>>;
}

export function summarize(leads: Lead[]): LeadCounts {
  const byStatus: Record<LeadStatus, number> = { new: 0, contacted: 0, qualified: 0, closed: 0, spam: 0 };
  const byType: Partial<Record<Lead["type"], number>> = {};
  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
    byType[l.type] = (byType[l.type] ?? 0) + 1;
  }
  return { total: leads.length, byStatus, byType };
}
