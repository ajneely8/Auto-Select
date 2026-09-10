"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useFieldError } from "./FormShell";
import { business } from "@/config/business";
import { addDays, formatSlot, SLOT_MINUTES, nowInDealerTz, slotsFor, MAX_DAYS_AHEAD, isClosedDay } from "@/lib/scheduling/hours";

/** e.g. "Available Monday–Saturday, 10:00 AM–5:30 PM (Central). Closed Sunday." — derived from business config. */
function describeBookingHours() {
  const first = business.hours.find((h) => h.open && h.close);
  if (!first?.open || !first.close) return "";
  const [h, m] = first.close.split(":").map(Number);
  const last = h * 60 + m - SLOT_MINUTES;
  const lastSlot = `${String(Math.floor(last / 60)).padStart(2, "0")}:${String(last % 60).padStart(2, "0")}`;
  const openDays = business.hoursSummary.filter((x) => x.value !== "Closed").map((x) => x.label).join(", ");
  const closedDays = business.hoursSummary.filter((x) => x.value === "Closed").map((x) => x.label).join(", ");
  return `Available ${openDays}, ${formatSlot(first.open)}–${formatSlot(lastSlot)} (Central).${closedDays ? ` Closed ${closedDays}.` : ""}`;
}

/**
 * Date + time picker constrained to business hours (Mon–Sat 10–6, dealership timezone).
 * Sundays and closed days are excluded from the list rather than disabled, so every option is valid.
 * Submits `date` (YYYY-MM-DD) and `time` (HH:MM); the server re-validates both.
 */
export function SlotPicker({ dateLabel = "Preferred date", timeLabel = "Preferred time", days = 21 }: { dateLabel?: string; timeLabel?: string; days?: number }) {
  const dateErr = useFieldError("date");
  const timeErr = useFieldError("time");
  const noteId = useId();
  const [today, setToday] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Computed after mount so server and client agree (the list depends on the current time).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(nowInDealerTz().date);
  }, []);

  const dates = useMemo(() => {
    if (!today) return [];
    const out: { value: string; label: string }[] = [];
    for (let i = 0; i <= Math.min(days + 10, MAX_DAYS_AHEAD) && out.length < days; i++) {
      const d = addDays(today, i);
      if (isClosedDay(d) || !slotsFor(d).length) continue;
      const [y, m, dd] = d.split("-").map(Number);
      const label = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, dd)));
      out.push({ value: d, label: i === 0 ? `Today · ${label}` : i === 1 ? `Tomorrow · ${label}` : label });
    }
    return out;
  }, [today, days]);

  const times = date ? slotsFor(date) : [];
  const hoursNote = describeBookingHours();
  const select =
    "block h-11 w-full appearance-none rounded-[var(--radius-sm)] border bg-white px-3 pr-9 text-[0.9375rem] text-ink focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent-text bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%234a5260' stroke-width='1.6'/%3E%3C/svg%3E\")] bg-[position:right_0.85rem_center] bg-no-repeat";

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor={dateErr.inputId} className="mb-1.5 block text-sm font-semibold text-ink">
          {dateLabel}
          <span className="ml-0.5 text-accent-text" aria-hidden>*</span>
          <span className="sr-only"> (required)</span>
        </label>
        <select
          id={dateErr.inputId}
          name="date"
          required
          data-label="a date"
          value={date}
          aria-invalid={dateErr.error ? true : undefined}
          aria-describedby={`${dateErr.errorId} ${noteId}`}
          onChange={(e) => {
            setDate(e.target.value);
            setTime("");
            dateErr.setError(null);
          }}
          className={`${select} ${dateErr.error ? "border-danger" : "border-line-strong"}`}
        >
          <option value="" disabled>
            {today ? "Choose a date" : "Loading dates…"}
          </option>
          {dates.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <p id={dateErr.errorId} className={dateErr.error ? "mt-1.5 flex items-start gap-1.5 text-sm text-danger" : "sr-only"} aria-live="polite">
          {dateErr.error && (
            <>
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {dateErr.error}
            </>
          )}
        </p>
      </div>
      <div>
        <label htmlFor={timeErr.inputId} className="mb-1.5 block text-sm font-semibold text-ink">
          {timeLabel}
          <span className="ml-0.5 text-accent-text" aria-hidden>*</span>
          <span className="sr-only"> (required)</span>
        </label>
        <select
          id={timeErr.inputId}
          name="time"
          required
          data-label="a time"
          value={time}
          disabled={!date}
          aria-invalid={timeErr.error ? true : undefined}
          aria-describedby={timeErr.errorId}
          onChange={(e) => {
            setTime(e.target.value);
            timeErr.setError(null);
          }}
          className={`${select} ${timeErr.error ? "border-danger" : "border-line-strong"} disabled:bg-surface disabled:text-muted`}
        >
          <option value="" disabled>
            {date ? "Choose a time" : "Choose a date first"}
          </option>
          {times.map((t) => (
            <option key={t} value={t}>
              {formatSlot(t)}
            </option>
          ))}
        </select>
        <p id={timeErr.errorId} className={timeErr.error ? "mt-1.5 flex items-start gap-1.5 text-sm text-danger" : "sr-only"} aria-live="polite">
          {timeErr.error && (
            <>
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {timeErr.error}
            </>
          )}
        </p>
      </div>
      <p id={noteId} className="-mt-2 text-xs text-muted sm:col-span-2">
        {hoursNote} Your request isn&apos;t confirmed until we contact you.
      </p>
    </div>
  );
}
