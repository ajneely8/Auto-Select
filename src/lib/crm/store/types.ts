import type { Lead, LeadStatus } from "@/lib/types";

/** The storage-dependent half of the CRM's lead access — swappable per `LEAD_STORE`. */
export interface CrmLeadStore {
  listLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  updateLeadStatus(id: string, status: LeadStatus): Promise<boolean>;
  addLeadNote(id: string, text: string): Promise<boolean>;
  deleteLead(id: string): Promise<boolean>;
}
