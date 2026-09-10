"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySession, getSession } from "@/lib/crm/auth";
import { updateLeadStatus } from "@/lib/crm/leads";
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
  revalidatePath(`/crm/leads/${id}`);
}
