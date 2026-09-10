"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySession, getSession } from "@/lib/crm/auth";
import { updateLeadStatus, addLeadNote, deleteLead } from "@/lib/crm/leads";
import type { LeadStatus } from "@/lib/types";

export async function logout() {
  await destroySession();
  redirect("/crm/login");
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  // Every server action under /crm re-checks the session itself — a layout guard alone would not
  // stop a direct call to this action if the cookie were ever missing by the time it runs.
  const session = await getSession();
  if (!session) redirect("/crm/login");
  await updateLeadStatus(id, status);
  revalidatePath("/crm");
  revalidatePath("/crm/leads");
  revalidatePath(`/crm/leads/${id}`);
}

export async function removeLead(id: string) {
  const session = await getSession();
  if (!session) redirect("/crm/login");
  await deleteLead(id);
  revalidatePath("/crm");
  revalidatePath("/crm/leads");
}

export interface NoteState {
  error?: string;
}

export async function addNote(id: string, _prev: NoteState, formData: FormData): Promise<NoteState> {
  const session = await getSession();
  if (!session) redirect("/crm/login");
  const text = String(formData.get("note") ?? "").trim();
  if (!text) return { error: "Write something before saving." };
  await addLeadNote(id, text);
  revalidatePath(`/crm/leads/${id}`);
  return {};
}
