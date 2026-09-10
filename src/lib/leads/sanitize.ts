/** Input sanitizing applied to every lead field before validation and storage. */

const TAGS = /<\/?[a-z][^>]*>/gi;

/** Removes ASCII control characters, keeping tab (9), newline (10), and carriage return (13). */
function stripControl(s: string) {
  let out = "";
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    if ((c < 32 && c !== 9 && c !== 10 && c !== 13) || c === 127) continue;
    out += ch;
  }
  return out;
}

export function cleanText(value: unknown, max = 2000): string {
  if (typeof value !== "string") return "";
  return stripControl(value).replace(TAGS, "").replace(/[ \t]+/g, " ").trim().slice(0, max);
}

export function cleanLine(value: unknown, max = 200): string {
  return cleanText(value, max).replace(/\s*\n\s*/g, " ");
}

export function digitsOnly(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

/** US phone → +1XXXXXXXXXX, or "" if not a plausible NANP number. */
export function normalizePhone(value: unknown) {
  let d = digitsOnly(value);
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? `+1${d}` : "";
}

export function formatPhone(e164: string) {
  const d = e164.replace(/^\+1/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : e164;
}

/** Flatten FormData into a plain object of cleaned strings (files excluded). Repeated keys join with commas. */
export function formDataToRecord(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string" || k.startsWith("$ACTION")) continue;
    out[k] = out[k] ? `${out[k]},${cleanLine(v, 200)}` : cleanText(v, 4000);
  }
  return out;
}
