"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { estimate, TERM_OPTIONS } from "@/lib/finance";
import { business } from "@/config/business";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function NumberInput({ label, value, onChange, prefix, suffix, step = 100, min = 0, max, hint }: { label: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string; step?: number; min?: number; max?: number; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Math.max(min, Math.min(max ?? Infinity, Number(e.target.value) || 0)))}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-white text-[0.9375rem] tabular focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25 ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-9" : "pr-3"}`}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Estimate-only calculator. Never presented as an offer of credit. */
export function PaymentCalculator({ price }: { price: number | null }) {
  const [vehiclePrice, setVehiclePrice] = useState(price ?? 20000);
  const [down, setDown] = useState(Math.round((price ?? 20000) * 0.1));
  const [trade, setTrade] = useState(0);
  const [apr, setApr] = useState(business.financing.calculatorExampleApr);
  const [term, setTerm] = useState<number>(72);
  const r = estimate({ price: vehiclePrice, down, trade, apr, months: term });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput label="Vehicle price" prefix="$" value={vehiclePrice} onChange={setVehiclePrice} step={500} hint="Before tax, title, license, and fees." />
        <NumberInput label="Down payment" prefix="$" value={down} onChange={setDown} step={500} />
        <NumberInput label="Trade-in value" prefix="$" value={trade} onChange={setTrade} step={500} hint="Minus any payoff you still owe." />
        <NumberInput label="Example APR" suffix="%" value={apr} onChange={setApr} step={0.25} max={36} hint="For illustration only — enter any rate." />
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-semibold text-ink">Term</legend>
          <div className="flex flex-wrap gap-2">
            {TERM_OPTIONS.map((t) => (
              <label key={t} className="inline-flex min-h-11 cursor-pointer items-center rounded-[var(--radius-sm)] border border-line-strong px-4 text-sm font-medium has-[:checked]:border-navy-900 has-[:checked]:bg-navy-900 has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent-text">
                <input type="radio" name="term" value={t} checked={term === t} onChange={() => setTerm(t)} className="sr-only" />
                {t} mo
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="rounded-[var(--radius-md)] bg-navy-900 p-5 text-white on-dark">
        <p className="text-sm text-white/75">Estimated monthly payment</p>
        <p className="mt-1 font-display text-4xl font-bold tabular" aria-live="polite">
          {usd(Math.round(r.payment))}
          <span className="text-lg font-semibold text-white/70">/mo</span>
        </p>
        <dl className="mt-4 grid gap-1.5 border-t border-white/15 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/70">Amount financed</dt>
            <dd className="tabular">{usd(r.financed)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/70">Estimated interest</dt>
            <dd className="tabular">{usd(Math.round(r.totalInterest))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/70">Total of payments</dt>
            <dd className="tabular">{usd(Math.round(r.totalPaid))}</dd>
          </div>
        </dl>
        <a href={business.financing.applicationUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] bg-white px-4 text-sm font-semibold text-navy-900 hover:bg-navy-100">
          Get pre-qualified<span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
      <p className="text-xs leading-relaxed text-muted lg:col-span-2">
        This calculator is an estimate for illustration only and is not an offer of credit. The example APR is not a quoted rate. Actual rates, terms, and payments
        depend on lender approval and your credit, and exclude tax, title, license, and dealer fees. <Link href="/financing" className="underline underline-offset-2">How financing works</Link>.
      </p>
    </div>
  );
}
