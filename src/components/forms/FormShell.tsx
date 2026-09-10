"use client";

import { createContext, useActionState, useCallback, useContext, useEffect, useId, useRef, useState, startTransition, type ReactNode, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { submitLead } from "@/app/(site)/actions/leads";
import { initialFormState } from "@/lib/leads/form-state";
import type { LeadType } from "@/lib/types";
import { track } from "@/lib/analytics";
import { business } from "@/config/business";
import { buttonClasses } from "@/components/ui/Button";

/* ───────────────────────── Form context: inline errors per field ───────────────────────── */

interface FormCtx {
  errors: Record<string, string>;
  setFieldError: (name: string, message: string | null) => void;
  formId: string;
}
const Ctx = createContext<FormCtx | null>(null);

export function useFieldError(name: string) {
  const ctx = useContext(Ctx);
  return {
    error: ctx?.errors[name] ?? null,
    setError: (m: string | null) => ctx?.setFieldError(name, m),
    errorId: `${ctx?.formId ?? "f"}-${name}-error`,
    inputId: `${ctx?.formId ?? "f"}-${name}`,
  };
}

/** Friendly messages for native constraint validation. */
export function messageFor(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string | null {
  const v = el.validity;
  if (v.valid) return null;
  const label = el.dataset.label ?? "this field";
  if (v.valueMissing) {
    if (el instanceof HTMLSelectElement || el.type === "radio") return `Please choose ${label}.`;
    if (el.type === "checkbox") return el.dataset.requiredMessage ?? "Please check this box to continue.";
    return `Please enter ${label}.`;
  }
  if (v.typeMismatch && el.type === "email") return "Please enter a valid email address, like name@example.com.";
  if (v.patternMismatch) return el.dataset.patternMessage ?? `Please check the format of ${label}.`;
  if (v.rangeUnderflow || v.rangeOverflow) {
    const i = el as HTMLInputElement;
    return `Please enter a value between ${i.min || "0"} and ${i.max}.`;
  }
  if (v.tooLong) return `Please shorten ${label}.`;
  if (v.badInput) return `Please enter a number for ${label}.`;
  return el.validationMessage || "Please check this field.";
}

/* ───────────────────────── Tracking fields captured once per visit ───────────────────────── */

function readAttribution() {
  const out: Record<string, string> = {};
  try {
    const stored = JSON.parse(sessionStorage.getItem("as_attribution") ?? "{}") as Record<string, string>;
    Object.assign(out, stored);
  } catch {}
  out._sourcePage = location.pathname;
  out._referrer = out._referrer || document.referrer;
  return out;
}

/* ───────────────────────── FormShell ───────────────────────── */

export function FormShell({
  formType,
  children,
  submitLabel = "Send",
  successTitle = "Thank you",
  successNext,
  className = "",
  analyticsExtra,
  compact = false,
}: {
  formType: LeadType;
  children: ReactNode;
  submitLabel?: string;
  successTitle?: string;
  successNext?: ReactNode;
  className?: string;
  analyticsExtra?: Record<string, string | number>;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitLead, initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState("");
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  const started = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formId = useId().replace(/:/g, "");
  // Callers often pass an inline object; keep it in a ref so effects don't re-run every render.
  const extraRef = useRef(analyticsExtra);
  useEffect(() => {
    extraRef.current = analyticsExtra;
  });

  useEffect(() => {
    // Client-only values set after mount to avoid hydration mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartedAt(String(Date.now()));
    setAttribution(readAttribution());
  }, []);

  // Merge server-side field errors into inline errors.
  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrors(state.fieldErrors);
      requestAnimationFrame(() => {
        const first = Object.keys(state.fieldErrors!)[0];
        formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      });
    }
    if (state.status === "error" && !state.fieldErrors) summaryRef.current?.focus();
    if (state.status === "success") {
      track("form_submitted", { form_type: formType, success: true, ...extraRef.current });
      successRef.current?.focus();
    }
  }, [state, formType]);

  const setFieldError = useCallback((name: string, message: string | null) => {
    setErrors((prev) => {
      if (!message && !prev[name]) return prev;
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }, []);

  function onFirstInteraction() {
    if (started.current) return;
    started.current = true;
    track("form_started", { form_type: formType, ...extraRef.current });
    if (formType === "trade-in") track("trade_in_started", extraRef.current);
    if (formType === "test-drive" || formType === "appointment") track("appointment_started", { form_type: formType });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Record<string, string> = {};
    for (const el of Array.from(form.elements)) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) continue;
      if (!el.name || !el.willValidate || next[el.name]) continue;
      const m = messageFor(el);
      if (m) next[el.name] = m;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    const fd = new FormData(form);
    startTransition(() => formAction(fd));
  }

  if (state.status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="rounded-[var(--radius-md)] border border-[#bfe0cb] bg-success-soft p-6 outline-none animate-fade-up">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" aria-hidden />
          <div>
            <h3 className="text-xl font-bold text-ink">{successTitle}</h3>
            <p className="mt-1 text-slate">{state.message}</p>
            {state.reference && (
              <p className="mt-3 text-sm text-slate">
                Reference number: <span className="font-semibold tabular text-ink">{state.reference}</span>
              </p>
            )}
            {successNext && <div className="mt-4 text-sm text-slate">{successNext}</div>}
            <p className="mt-4 text-sm text-slate">
              Need an answer sooner? Call{" "}
              <a className="font-semibold text-navy-700 underline underline-offset-2" href={`tel:${business.phone.e164}`}>
                {business.phone.display}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <Ctx.Provider value={{ errors, setFieldError, formId }}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={onSubmit}
        onFocusCapture={onFirstInteraction}
        noValidate
        className={`${className}`}
        aria-describedby={errorCount || state.status === "error" ? `${formId}-summary` : undefined}
      >
        <input type="hidden" name="_formType" value={formType} />
        <input type="hidden" name="_startedAt" value={startedAt} />
        {Object.entries(attribution).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Company website
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        <div
          id={`${formId}-summary`}
          ref={summaryRef}
          tabIndex={-1}
          aria-live="polite"
          className={errorCount || state.status === "error" ? "mb-5 flex items-start gap-2 rounded-[var(--radius-sm)] border border-[#f1c0bc] bg-danger-soft p-3 text-sm text-danger outline-none" : "sr-only"}
        >
          {(errorCount > 0 || state.status === "error") && (
            <>
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{errorCount > 0 ? `Please fix ${errorCount === 1 ? "1 field" : `${errorCount} fields`} below.` : state.message}</span>
            </>
          )}
        </div>

        <div className={compact ? "grid gap-4" : "grid gap-5"}>{children}</div>

        <div className={`mt-6 flex flex-col gap-3 ${compact ? "" : "sm:flex-row sm:items-center sm:justify-between"}`}>
          <p className="text-xs leading-relaxed text-muted max-w-md">
            <span className="text-accent-text" aria-hidden>*</span> Required. We use your information only to respond to this request. See our{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-ink">
              Privacy Policy
            </Link>
            .
          </p>
          <button type="submit" disabled={pending} className={buttonClasses("primary", "lg", compact ? "w-full" : "w-full sm:w-auto")}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> Sending…
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </Ctx.Provider>
  );
}
