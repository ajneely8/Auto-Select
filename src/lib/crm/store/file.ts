import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDir } from "@/lib/data-dir";
import type { Lead, LeadStatus } from "@/lib/types";
import type { CrmLeadStore } from "./types";

/**
 * `LEAD_STORE=file` (the default). Fine for a single small-business instance on a VPS or local
 * dev, but not durable on serverless hosting and not safe for concurrent writers — see
 * ./blobs.ts for the Netlify-hosted alternative.
 */
const FILE = () => path.join(dataDir(), "leads.ndjson");

async function listLeads(): Promise<Lead[]> {
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

async function getLead(id: string): Promise<Lead | null> {
  const leads = await listLeads();
  return leads.find((l) => l.id === id) ?? null;
}

async function rewrite(leads: Lead[]) {
  // Oldest-first on disk so the file's natural order stays append-like.
  const body = leads
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((l) => JSON.stringify(l))
    .join("\n");
  await fs.writeFile(FILE(), body + (body ? "\n" : ""), { mode: 0o600 });
}

async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  const leads = await listLeads();
  const target = leads.find((l) => l.id === id);
  if (!target) return false;
  target.status = status;
  await rewrite(leads);
  return true;
}

async function addLeadNote(id: string, text: string): Promise<boolean> {
  const trimmed = text.trim().slice(0, 2000);
  if (!trimmed) return false;
  const leads = await listLeads();
  const target = leads.find((l) => l.id === id);
  if (!target) return false;
  target.notes = [...(target.notes ?? []), { text: trimmed, at: new Date().toISOString() }];
  await rewrite(leads);
  return true;
}

async function deleteLead(id: string): Promise<boolean> {
  const leads = await listLeads();
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  await rewrite(next);
  // Best-effort: also clear any trade-in photos uploaded for this lead. Not fatal if it's already gone.
  await fs.rm(path.join(dataDir(), "uploads", id), { recursive: true, force: true }).catch(() => {});
  return true;
}

export const fileLeadStore: CrmLeadStore = { listLeads, getLead, updateLeadStatus, addLeadNote, deleteLead };
