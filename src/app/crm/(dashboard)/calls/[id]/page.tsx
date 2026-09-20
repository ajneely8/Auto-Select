import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Clock, Car, CalendarCheck, PhoneForwarded, UserCheck, Bot, PhoneOff } from "lucide-react";
import { callLogStore } from "@/lib/calls";
import { callerLabel, formatDuration, outcomeLabel, withContacts } from "@/lib/calls/display";
import { formatDateTime } from "@/lib/crm/format";
import { formatPhone } from "@/lib/leads/sanitize";

export const metadata = { title: "Call", robots: { index: false, follow: false } };

const CARD = "rounded-[20px] border border-white/10 bg-[#161616] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_28px_-14px_rgba(0,0,0,0.7)]";

function Row({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-lime-300" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-white/85">{children}</dd>
      </div>
    </div>
  );
}

/** Splits a "AI: …\nUser: …" transcript into speaker turns when it has that shape; otherwise shows it as-is. */
function transcriptTurns(t: string): { speaker: string | null; text: string }[] {
  return t
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = /^(AI|User|Assistant|Customer|Caller|Bot|System)\s*:\s*(.*)$/i.exec(line);
      return m ? { speaker: m[1], text: m[2] } : { speaker: null, text: line };
    });
}

export default async function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await callLogStore.get(id);
  if (!found) notFound();
  const [c] = await withContacts([found]);
  const when = c.startedAt ?? c.createdAt;
  const turns = c.transcript ? transcriptTurns(c.transcript) : [];
  const rawText = c.raw ? JSON.stringify(c.raw, null, 2) : null;

  return (
    <div className="mx-auto grid max-w-3xl gap-5">
      <Link href="/crm/calls" className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime-300 hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Back to call logs
      </Link>

      <div className={`${CARD} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="break-words font-display text-2xl font-bold text-white">{callerLabel(c)}</h1>
            <p className="mt-1 text-sm text-white/50">{formatDateTime(when)}</p>
          </div>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">{outcomeLabel(c.outcome)}</span>
        </div>

        <h2 className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/40">AI summary</h2>
        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-white/85">{c.summary ?? "No summary was included in this call report."}</p>
      </div>

      <div className={`${CARD} p-5 sm:p-6`}>
        <dl className="divide-y divide-white/10">
          <Row icon={Phone} label="Caller">
            {c.callerName ?? "Name not provided"}
            <br />
            {c.callerPhone ? formatPhone(c.callerPhone) : (c.callerNumber ?? "Number withheld")}
          </Row>
          <Row icon={UserCheck} label="CRM contact">
            {c.contactId ? (
              <Link href={`/crm/leads/${c.contactId}`} className="font-semibold text-lime-300 hover:underline">
                {c.contactName ?? "Open lead"}
              </Link>
            ) : (
              "Not matched to a lead or contact"
            )}
          </Row>
          <Row icon={Car} label="Vehicle of interest">{c.vehicleInterest ?? "Not recorded"}</Row>
          <Row icon={CalendarCheck} label="Test drive">{c.testDrive ?? "Not requested / not recorded"}</Row>
          <Row icon={PhoneForwarded} label="Callback">
            {c.callbackRequested === true ? (c.callbackDetails ?? "Requested") : c.callbackRequested === false ? "Not requested" : "Not recorded"}
          </Row>
          <Row icon={Clock} label="Duration">{formatDuration(c.durationSeconds)}</Row>
          <Row icon={PhoneOff} label="Ended reason">{c.endedReason ?? "Not recorded"}</Row>
          <Row icon={Bot} label="Vapi call ID">
            <code className="text-xs text-white/60">{c.vapiCallId}</code>
          </Row>
        </dl>
      </div>

      <div className={`${CARD} p-5 sm:p-6`}>
        <h2 className="font-display text-lg font-bold text-white">Transcript</h2>
        {turns.length === 0 ? (
          <p className="mt-2 text-sm text-white/50">No transcript was included in this call report.</p>
        ) : (
          <ol className="mt-3 grid max-h-[32rem] gap-2.5 overflow-y-auto pr-1" aria-label="Call transcript">
            {turns.map((t, i) => {
              const ai = t.speaker && /^(ai|assistant|bot)$/i.test(t.speaker);
              return (
                <li key={i} className={`max-w-[92%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${ai ? "self-start border border-white/10 bg-white/5 text-white/85" : "self-end bg-lime-400/15 text-white"}`}>
                  {t.speaker && <span className="mb-0.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-white/40">{t.speaker}</span>}
                  <span className="whitespace-pre-wrap break-words">{t.text}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {rawText && (
        <details className={`${CARD} p-5 sm:p-6`}>
          <summary className="cursor-pointer text-sm font-semibold text-white/70">Raw Vapi report (staff only)</summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-white/60">{rawText}</pre>
        </details>
      )}
    </div>
  );
}
