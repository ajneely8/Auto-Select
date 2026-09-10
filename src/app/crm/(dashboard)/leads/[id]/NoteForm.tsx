"use client";

import { useActionState, useEffect, useRef } from "react";
import { StickyNote, AlertCircle } from "lucide-react";
import type { LeadNote } from "@/lib/types";
import { addNote, type NoteState } from "../../actions";
import { formatDateTime } from "@/lib/crm/format";

const initial: NoteState = {};

export function NoteForm({ leadId, notes }: { leadId: string; notes: LeadNote[] }) {
  const action = addNote.bind(null, leadId);
  const [state, formAction, pending] = useActionState(action, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) formRef.current?.reset();
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <section aria-labelledby="notes-heading" className="rounded-[var(--radius-md)] border border-line bg-white p-5 sm:p-6">
      <h2 id="notes-heading" className="flex items-center gap-1.5 font-display text-lg font-bold text-ink">
        <StickyNote className="size-4" aria-hidden /> Internal notes
      </h2>
      <p className="mt-0.5 text-xs text-muted">Staff-only — never shown to the customer.</p>

      {notes.length > 0 && (
        <ul className="mt-4 grid gap-3 border-b border-line pb-4">
          {[...notes]
            .slice()
            .reverse()
            .map((n, i) => (
              <li key={i} className="rounded-[var(--radius-sm)] bg-surface p-3 text-sm">
                <p className="whitespace-pre-wrap text-ink">{n.text}</p>
                <p className="mt-1 text-xs text-muted">{formatDateTime(n.at)}</p>
              </li>
            ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="mt-4 grid gap-2">
        {state.error && (
          <p className="flex items-center gap-1.5 text-sm text-danger">
            <AlertCircle className="size-3.5" aria-hidden /> {state.error}
          </p>
        )}
        <label htmlFor="note" className="sr-only">
          Add a note
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          placeholder="Called and left a voicemail…"
          className="rounded-[var(--radius-sm)] border border-line-strong bg-white p-3 text-sm focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-9 w-fit items-center justify-center rounded-[var(--radius-sm)] bg-navy-900 px-4 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add note"}
        </button>
      </form>
    </section>
  );
}
