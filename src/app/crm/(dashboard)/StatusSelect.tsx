"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { LeadStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/crm/format";
import { setLeadStatus } from "./actions";

const TONE: Record<LeadStatus, string> = {
  new: "bg-accent-soft text-accent-text border-accent/30",
  contacted: "bg-navy-100 text-navy-900 border-navy-900/20",
  qualified: "bg-success-soft text-success border-[#bfe0cb]",
  closed: "bg-surface text-slate border-line-strong",
  spam: "bg-danger-soft text-danger border-[#f1c0bc]",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-semibold ${TONE[status]}`}>{STATUS_LABELS[status]}</span>;
}

/** Inline status changer. Optimistic-ish: reflects the pick immediately, reverts if the save fails. */
export function StatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <select
        value={value}
        disabled={pending}
        aria-label="Change lead status"
        onChange={(e) => {
          const next = e.target.value as LeadStatus;
          const prev = value;
          setValue(next);
          startTransition(async () => {
            try {
              await setLeadStatus(leadId, next);
            } catch {
              setValue(prev);
            }
          });
        }}
        className="h-10 rounded-[var(--radius-sm)] border border-line-strong bg-white pl-3 pr-8 text-sm font-medium focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-60"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted" aria-hidden />}
    </div>
  );
}
