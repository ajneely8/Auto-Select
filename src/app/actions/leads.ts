"use server";

import { headers } from "next/headers";
import { processLead } from "@/lib/leads/pipeline";
import type { FormState } from "@/lib/leads/form-state";
import type { LeadType } from "@/lib/types";
import { typeSchemas } from "@/lib/leads/schemas";

const TYPES = new Set(Object.keys(typeSchemas));

/** Single server action behind every lead form. The form's hidden `_formType` field picks the schema. */
export async function submitLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const type = String(formData.get("_formType") ?? "");
  if (!TYPES.has(type)) return { status: "error", message: "This form is misconfigured. Please call us instead." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";

  try {
    return await processLead(type as LeadType, formData, { ip, userAgent: h.get("user-agent") ?? "" });
  } catch (err) {
    console.error("[leads] unexpected error:", err);
    return { status: "error", message: "Something went wrong on our end. Please try again, or call us — we're happy to help." };
  }
}
