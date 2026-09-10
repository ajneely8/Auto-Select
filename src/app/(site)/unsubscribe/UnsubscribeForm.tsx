"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { unsubscribeAction, type UnsubscribeState } from "./actions";

const initialState: UnsubscribeState = { status: "idle" };

export function UnsubscribeForm({ email, token, contactEmail, contactPhone }: { email: string; token: string; contactEmail: string; contactPhone: string }) {
  const [state, formAction, pending] = useActionState(unsubscribeAction, initialState);
  const resultRef = useRef<HTMLDivElement>(null);

  // Move focus to the result so keyboard and screen-reader users hear the outcome.
  useEffect(() => {
    if (state.status !== "idle") resultRef.current?.focus();
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="outline-none">
        <div className="flex items-start gap-3">
          <CircleCheck className="mt-0.5 size-6 shrink-0 text-success" aria-hidden />
          <div>
            <h2 className="text-2xl font-bold">You&apos;re unsubscribed</h2>
            <p className="mt-2 text-slate">
              We&apos;ve turned off inventory alerts and saved-vehicle reminders for <strong className="break-all text-ink">{email}</strong>. It may take a short
              time for any message already on its way to stop.
            </p>
            <p className="mt-2 text-slate">
              You may still receive messages about a request or purchase you&apos;re actively working on with us. To stop other emails, contact us at{" "}
              <a href={`mailto:${contactEmail}`} className="font-semibold text-navy-700 underline underline-offset-2">
                {contactEmail}
              </a>{" "}
              or call {contactPhone}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/inventory" variant="secondary">
                Browse inventory
              </ButtonLink>
              <ButtonLink href="/" variant="outline">
                Back to home
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <div ref={resultRef} tabIndex={-1} role="alert" className="outline-none">
        <InvalidLinkMessage contactEmail={contactEmail} />
      </div>
    );
  }

  return (
    <form action={formAction}>
      <h2 className="text-2xl font-bold">Unsubscribe from inventory alerts?</h2>
      <p className="mt-2 text-slate">
        This stops inventory alerts and saved-vehicle reminders sent to <strong className="break-all text-ink">{email}</strong>.
      </p>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />

      {state.status === "error" && (
        <div ref={resultRef} tabIndex={-1} role="alert" className="mt-5 flex items-start gap-2 rounded-[var(--radius-sm)] border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger outline-none">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>Something went wrong on our end, and we couldn&apos;t update your preferences. Please try again in a moment.</span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={pending} aria-disabled={pending}>
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending ? "Unsubscribing…" : "Yes, unsubscribe me"}
        </Button>
        <Link href="/" className="inline-flex min-h-12 items-center px-2 font-semibold text-navy-700 underline-offset-2 hover:underline">
          Keep my alerts
        </Link>
      </div>
    </form>
  );
}

export function InvalidLinkMessage({ contactEmail }: { contactEmail: string }) {
  return (
    <div className="flex items-start gap-3">
      <CircleAlert className="mt-0.5 size-6 shrink-0 text-warning" aria-hidden />
      <div>
        <h2 className="text-2xl font-bold">This unsubscribe link isn&apos;t valid</h2>
        <p className="mt-2 text-slate">
          The link may be incomplete or may have been changed. Please use the unsubscribe link from your most recent alert email, or email us at{" "}
          <a href={`mailto:${contactEmail}`} className="font-semibold text-navy-700 underline underline-offset-2">
            {contactEmail}
          </a>{" "}
          and we&apos;ll remove you.
        </p>
      </div>
    </div>
  );
}
