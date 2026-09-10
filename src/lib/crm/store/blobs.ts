import "server-only";
import { getStore, type Store } from "@netlify/blobs";
import type { Lead, LeadStatus } from "@/lib/types";
import type { CrmLeadStore } from "./types";

/**
 * `LEAD_STORE=netlify-blobs` — the durable option when the site runs on Netlify. Netlify's Next.js
 * runtime injects the store credentials automatically at request time, so `getStore` needs no
 * manual site ID or token here (that's only required calling it from outside Netlify's platform).
 *
 * One lead per blob (keyed by lead id) rather than one big rewritten file: every status change or
 * note only touches its own key, so concurrent edits from two staff members can't clobber each
 * other the way the file-based store's whole-file rewrite could.
 */
function leadsStore(): Store {
  return getStore({ name: "leads", consistency: "strong" });
}

function uploadsStore(): Store {
  return getStore({ name: "lead-uploads", consistency: "strong" });
}

async function listKeys(store: Store): Promise<string[]> {
  const keys: string[] = [];
  for await (const page of store.list({ paginate: true })) {
    keys.push(...page.blobs.map((b) => b.key));
  }
  return keys;
}

async function listLeads(): Promise<Lead[]> {
  const store = leadsStore();
  const keys = await listKeys(store);
  const leads = await Promise.all(keys.map((key) => store.get(key, { type: "json" }) as Promise<Lead | null>));
  return leads.filter((l): l is Lead => l != null).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function getLead(id: string): Promise<Lead | null> {
  return (await leadsStore().get(id, { type: "json" })) as Lead | null;
}

async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  const store = leadsStore();
  const lead = (await store.get(id, { type: "json" })) as Lead | null;
  if (!lead) return false;
  lead.status = status;
  await store.setJSON(id, lead);
  return true;
}

async function addLeadNote(id: string, text: string): Promise<boolean> {
  const trimmed = text.trim().slice(0, 2000);
  if (!trimmed) return false;
  const store = leadsStore();
  const lead = (await store.get(id, { type: "json" })) as Lead | null;
  if (!lead) return false;
  lead.notes = [...(lead.notes ?? []), { text: trimmed, at: new Date().toISOString() }];
  await store.setJSON(id, lead);
  return true;
}

async function deleteLead(id: string): Promise<boolean> {
  const store = leadsStore();
  const existing = await store.get(id, { type: "json" });
  if (existing == null) return false;
  await store.delete(id);
  // Best-effort: also clear any trade-in photos uploaded for this lead. Not fatal if it's already gone.
  const uploads = uploadsStore();
  const keys = (await listKeys(uploads)).filter((key) => key.startsWith(`${id}/`));
  await Promise.all(keys.map((key) => uploads.delete(key)));
  return true;
}

export const blobLeadStore: CrmLeadStore = { listLeads, getLead, updateLeadStatus, addLeadNote, deleteLead };
