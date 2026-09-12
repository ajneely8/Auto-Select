"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { removeLead } from "./actions";

/**
 * Deleting a lead is permanent (it also clears any uploaded trade-in photos), so this always
 * confirms first rather than acting on a single click.
 */
export function DeleteLeadButton({ leadId, name, redirectTo, compact }: { leadId: string; name: string; redirectTo?: string; compact?: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onConfirm() {
    startTransition(async () => {
      await removeLead(leadId);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-danger/30 bg-danger-soft px-2 py-1 text-xs">
        <AlertTriangle className="size-3.5 shrink-0 text-danger" aria-hidden />
        <span className="text-danger">Delete {name}?</span>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="ml-1 rounded-[var(--radius-xs)] bg-danger px-2 py-0.5 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="rounded-[var(--radius-xs)] p-0.5 text-danger hover:bg-danger/10" aria-label="Cancel">
          <X className="size-3.5" aria-hidden />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={
        compact
          ? "inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-white/15 text-white/50 hover:border-danger hover:text-danger"
          : "inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-white/15 px-3 text-sm font-semibold text-white/50 hover:border-danger hover:text-danger"
      }
      aria-label={`Delete lead from ${name}`}
    >
      <Trash2 className="size-4" aria-hidden />
      {!compact && "Delete"}
    </button>
  );
}
