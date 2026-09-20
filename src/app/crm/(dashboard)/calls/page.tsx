import Link from "next/link";
import { PhoneCall, PhoneIncoming, Search, ArrowRight, UserCheck, Clock } from "lucide-react";
import { callLogStore } from "@/lib/calls";
import { queryCalls } from "@/lib/calls/store";
import { callerLabel, formatDuration, outcomeLabel, withContacts } from "@/lib/calls/display";
import { formatDateTime, relativeTime } from "@/lib/crm/format";

export const metadata = { title: "Call logs", robots: { index: false, follow: false } };

const CARD = "rounded-[20px] border border-white/10 bg-[#161616] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_-14px_rgba(0,0,0,0.7)]";
const FIELD =
  "h-10 w-full min-w-0 rounded-[var(--radius-sm)] border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/25 [color-scheme:dark]";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const day = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export default async function CallLogsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 80);
  const outcome = one(sp.outcome).slice(0, 80);
  const from = day(one(sp.from));
  const to = day(one(sp.to));
  const pageNum = Number.parseInt(one(sp.page), 10) || 1;

  const all = await withContacts(await callLogStore.list());
  const outcomes = [...new Set(all.map((c) => c.outcome).filter((o): o is string => !!o))].sort();
  const result = queryCalls(all, { q, outcome: outcome || undefined, from, to, page: pageNum, pageSize: 20 });
  const filtering = !!(q || outcome || from || to);

  const withPage = (page: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (outcome) p.set("outcome", outcome);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (page > 1) p.set("page", String(page));
    const s = p.toString();
    return `/crm/calls${s ? `?${s}` : ""}`;
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Call logs</h1>
        <p className="mt-1 text-sm text-white/50">Every call your AI receptionist has handled, with the transcript and summary.</p>
      </div>

      <form method="get" action="/crm/calls" className={`${CARD} grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]`}>
        <div className="relative">
          <label htmlFor="q" className="sr-only">
            Search by caller name or phone
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Caller name or phone…" className={`${FIELD} pl-9`} />
        </div>
        <div>
          <label htmlFor="outcome" className="sr-only">
            Outcome
          </label>
          <select id="outcome" name="outcome" defaultValue={outcome} className={FIELD} disabled={outcomes.length === 0}>
            <option value="" className="bg-[#161616]">
              {outcomes.length === 0 ? "No outcomes recorded yet" : "All outcomes"}
            </option>
            {outcomes.map((o) => (
              <option key={o} value={o} className="bg-[#161616]">
                {outcomeLabel(o)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="sr-only">
            From date
          </label>
          <input id="from" name="from" type="date" defaultValue={from} className={FIELD} />
        </div>
        <div>
          <label htmlFor="to" className="sr-only">
            To date
          </label>
          <input id="to" name="to" type="date" defaultValue={to} className={FIELD} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="min-h-10 rounded-[var(--radius-sm)] bg-lime-400 px-4 text-sm font-semibold text-black hover:bg-lime-300">
            Apply
          </button>
          {filtering && (
            <Link href="/crm/calls" className="inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border border-white/15 px-3 text-sm font-medium text-white/80 hover:border-white/35">
              Clear
            </Link>
          )}
        </div>
      </form>

      {all.length === 0 ? (
        <div className={`${CARD} p-10 text-center`}>
          <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-white/10 text-lime-300">
            <PhoneIncoming className="size-5" aria-hidden />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-white">No calls recorded yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
            Calls appear here automatically once the Vapi → n8n workflow is connected and a call finishes. Setup steps are in <code className="text-white/70">docs/vapi-n8n-integration.md</code>.
          </p>
        </div>
      ) : result.total === 0 ? (
        <div className={`${CARD} p-10 text-center text-sm text-white/50`}>No calls match those filters.</div>
      ) : (
        <>
          <p className="text-sm text-white/50">
            {result.total} {result.total === 1 ? "call" : "calls"}
            {filtering ? " match" : ""} · newest first
          </p>
          <ul className="grid gap-3">
            {result.items.map((c) => {
              const when = c.startedAt ?? c.createdAt;
              return (
                <li key={c.id}>
                  <Link
                    href={`/crm/calls/${c.id}`}
                    className={`${CARD} grid gap-3 p-4 transition-[border-color] duration-200 hover:border-lime-400/30 focus-visible:border-lime-400 focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-5`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1.5 truncate font-display text-lg font-bold text-white">
                          <PhoneCall className="size-4 shrink-0 text-lime-300" aria-hidden />
                          {callerLabel(c)}
                        </span>
                        {c.contactId && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-2 py-0.5 text-xs font-semibold text-lime-300">
                            <UserCheck className="size-3" aria-hidden /> {c.contactName ?? "CRM contact"}
                          </span>
                        )}
                        <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs font-medium text-white/60">{outcomeLabel(c.outcome)}</span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-white/45">
                        <span title={formatDateTime(when)} suppressHydrationWarning>
                          {formatDateTime(when)} · {relativeTime(when)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" aria-hidden /> {formatDuration(c.durationSeconds)}
                        </span>
                        {c.vehicleInterest && <span className="text-lime-300">{c.vehicleInterest}</span>}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70">{c.summary ?? "No summary was included in this call report."}</p>
                    </div>
                    <span className="hidden items-center gap-1 text-sm font-semibold text-lime-300 sm:inline-flex">
                      View <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {result.pageCount > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-between gap-3 text-sm">
              <p className="text-white/45">
                Page {result.page} of {result.pageCount}
              </p>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <Link href={withPage(result.page - 1)} className="min-h-9 rounded-[var(--radius-sm)] border border-white/15 px-3 py-2 font-medium text-white/80 hover:border-white/35">
                    Previous
                  </Link>
                ) : (
                  <span className="min-h-9 rounded-[var(--radius-sm)] border border-white/10 px-3 py-2 text-white/30">Previous</span>
                )}
                {result.page < result.pageCount ? (
                  <Link href={withPage(result.page + 1)} className="min-h-9 rounded-[var(--radius-sm)] border border-white/15 px-3 py-2 font-medium text-white/80 hover:border-white/35">
                    Next
                  </Link>
                ) : (
                  <span className="min-h-9 rounded-[var(--radius-sm)] border border-white/10 px-3 py-2 text-white/30">Next</span>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
