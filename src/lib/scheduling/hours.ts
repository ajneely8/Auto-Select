/**
 * Business-hours logic in the dealership's timezone. Isomorphic (used by the date/time picker and the server).
 * Appointments: 30-minute slots, last slot 30 minutes before close, no Sundays, up to 60 days out,
 * same-day slots must be at least 60 minutes from now.
 */
import { business } from "@/config/business";

export const SLOT_MINUTES = 30;
export const MAX_DAYS_AHEAD = 60;
const LEAD_TIME_MIN = 60;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Current date/time parts in the dealership timezone. */
export function nowInDealerTz(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: business.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** Day of week (0=Sunday) for a "YYYY-MM-DD" calendar date, independent of the viewer's timezone. */
export function dayOfWeek(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function hoursFor(date: string) {
  return business.hours.find((h) => h.day === dayOfWeek(date)) ?? null;
}

export function isClosedDay(date: string) {
  const h = hoursFor(date);
  return !h || !h.open || !h.close;
}

export function slotsFor(date: string, now = new Date()): string[] {
  const h = hoursFor(date);
  if (!h?.open || !h.close) return [];
  const today = nowInDealerTz(now);
  if (date < today.date || date > addDays(today.date, MAX_DAYS_AHEAD)) return [];
  const slots: string[] = [];
  for (let t = toMin(h.open); t <= toMin(h.close) - SLOT_MINUTES; t += SLOT_MINUTES) {
    if (date === today.date && t < today.minutes + LEAD_TIME_MIN) continue;
    slots.push(toHHMM(t));
  }
  return slots;
}

export type SlotCheck = { ok: true } | { ok: false; field: "date" | "time"; message: string };

export function validateSlot(date: string, time: string, now = new Date()): SlotCheck {
  if (dayOfWeek(date) === 0) return { ok: false, field: "date", message: "We're closed on Sundays. Please choose Monday through Saturday." };
  if (isClosedDay(date)) return { ok: false, field: "date", message: "We're closed that day. Please choose another date." };
  const today = nowInDealerTz(now).date;
  if (date < today) return { ok: false, field: "date", message: "Please choose a future date." };
  if (date > addDays(today, MAX_DAYS_AHEAD)) return { ok: false, field: "date", message: `Please choose a date within the next ${MAX_DAYS_AHEAD} days.` };
  if (!slotsFor(date, now).includes(time)) return { ok: false, field: "time", message: "Please choose an available time during business hours (10:00 AM–5:30 PM)." };
  return { ok: true };
}

export function formatSlot(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDateLong(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Is the dealership open right now? Used for the "Open now" indicator. */
export function openNow(now = new Date()) {
  const { date, minutes } = nowInDealerTz(now);
  const h = hoursFor(date);
  if (!h?.open || !h.close) return false;
  return minutes >= toMin(h.open) && minutes < toMin(h.close);
}
