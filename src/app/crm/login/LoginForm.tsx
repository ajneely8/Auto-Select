"use client";

import { useActionState } from "react";
import { Loader2, AlertCircle, LockKeyhole } from "lucide-react";
import { login, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="grid gap-5">
      {state.error && (
        <div role="alert" className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-[#f1c0bc] bg-danger-soft p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 text-[0.9375rem] focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-white px-3 text-[0.9375rem] focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-navy-900 font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden /> Signing in…
          </>
        ) : (
          <>
            <LockKeyhole className="size-4" aria-hidden /> Sign in
          </>
        )}
      </button>
    </form>
  );
}
