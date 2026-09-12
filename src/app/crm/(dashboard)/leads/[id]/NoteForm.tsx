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
    <section aria-labelledby="notes-heading" className="rounded-[var(--radius-lg)] border border-white/10 bg-[#161616] p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] sm:p-6">
      <h2 id="notes-heading" className="flex items-center gap-1.5 font-display text-lg font-bold text-white">
        <StickyNote className="size-4" aria-hidden /> Internal notes
      </h2>
      <p className="mt-0.5 text-xs text-white/40">Staff-only — never shown to the customer.</p>

      {notes.length > 0 && (
        <ul className="mt-4 grid gap-3 border-b border-white/10 pb-4">
          {[...notes]
            .slice()
            .reverse()
            .map((n, i) => (
              <li key={i} className="rounded-[var(--radius-sm)] bg-white/5 p-3 text-sm">
                <p className="whitespace-pre-wrap text-white">{n.text}</p>
                <p className="mt-1 text-xs text-white/40">{formatDateTime(n.at)}</p>
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
          className="rounded-[var(--radius-sm)] border border-white/15 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/25"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-9 w-fit items-center justify-center rounded-[var(--radius-sm)] bg-lime-400 px-4 text-sm font-semibold text-black hover:bg-lime-300 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add note"}
        </button>
      </form>
    </section>
  );
}
