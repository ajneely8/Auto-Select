"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { MessageCircle, X, SendHorizontal, RotateCcw, Loader2 } from "lucide-react";
import type { AssistantCard, AssistantEvent, ChatTurn } from "@/lib/assistant/types";
import { track } from "@/lib/analytics";
import { business } from "@/config/business";

interface UiMessage extends ChatTurn {
  id: string;
  cards?: AssistantCard[];
  status?: string;
  error?: boolean;
}

const STORE_KEY = "as_assistant_v1";
const newId = () => Math.random().toString(36).slice(2, 10);
const isVdp = (p: string) => /^\/inventory\/[^/]+$/.test(p);

/* ───────────── Tiny, safe markdown: paragraphs, "- " lists, **bold**, [links](/internal) ───────────── */

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${keyBase}-b${i++}`}>{m[1]}</strong>);
    else {
      const href = m[3];
      // Only site-relative links (and our own domain) are rendered as links.
      const safe = href.startsWith("/") && !href.startsWith("//") ? href : /^https:\/\/(www\.)?autoselectgroups\.com\//.test(href) ? href : null;
      out.push(
        safe ? (
          <Link key={`${keyBase}-l${i++}`} href={safe} className="font-semibold text-navy-700 underline underline-offset-2 hover:text-accent-text">
            {m[2]}
          </Link>
        ) : (
          <Fragment key={`${keyBase}-t${i++}`}>{m[2]}</Fragment>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Rich({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, bi) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-•*]\s+/.test(l) || !l.trim())) {
          return (
            <ul key={bi} className="my-1.5 grid gap-1 pl-4 [list-style:disc]">
              {lines.filter((l) => l.trim()).map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-•*]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="my-1.5 first:mt-0 last:mb-0">
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {/^\s*[-•*]\s+/.test(l) ? <>• {inline(l.replace(/^\s*[-•*]\s+/, ""), `${bi}-${li}`)}</> : inline(l, `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

function Cards({ cards }: { cards: AssistantCard[] }) {
  return (
    <ul className="mt-2 grid gap-2">
      {cards.map((c) => (
        <li key={c.stockNumber}>
          <Link href={c.url} className="flex gap-3 rounded-[var(--radius-sm)] border border-line bg-white p-2 hover:border-line-strong hover:shadow-[var(--shadow-card)]">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[3px] bg-surface-2">
              {c.photo && <Image src={c.photo} alt="" fill sizes="80px" className="object-cover" />}
            </div>
            <div className="min-w-0 text-sm">
              <p className="truncate font-semibold text-ink">{c.title}</p>
              <p className="tabular text-ink">
                <span className="font-semibold">{c.price != null ? `$${c.price.toLocaleString("en-US")}` : "Call for price"}</span>
                <span className="text-muted"> · {c.mileage.toLocaleString("en-US")} mi</span>
              </p>
              <p className="text-xs text-muted">Stock {c.stockNumber}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function InventoryAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const titleId = useId();

  // Restore this tab's conversation.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "[]") as UiMessage[];
       
      if (Array.isArray(saved)) setMessages(saved.filter((m) => !m.status));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [messages, open]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  async function send(text: string) {
    const q = text.trim().slice(0, 1200);
    if (!q || busy) return;
    track("assistant_question", { location: pathname });
    const user: UiMessage = { id: newId(), role: "user", content: q };
    const reply: UiMessage = { id: newId(), role: "assistant", content: "", status: "Thinking…" };
    const history = [...messages.filter((m) => m.content && !m.error), user];
    setMessages([...messages, user, reply]);
    setInput("");
    setBusy(true);

    const update = (fn: (m: UiMessage) => UiMessage) => setMessages((all) => all.map((m) => (m.id === reply.id ? fn(m) : m)));
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), path: pathname }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Request failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const lineStr = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!lineStr) continue;
          const ev = JSON.parse(lineStr) as AssistantEvent;
          if (ev.type === "text") update((m) => ({ ...m, content: m.content + ev.delta, status: undefined }));
          else if (ev.type === "status") update((m) => ({ ...m, status: ev.message }));
          else if (ev.type === "vehicles") update((m) => ({ ...m, cards: [...(m.cards ?? []), ...ev.vehicles.filter((c) => !m.cards?.some((x) => x.stockNumber === c.stockNumber))].slice(0, 4) }));
          else if (ev.type === "error") update((m) => ({ ...m, content: m.content || ev.message, error: !m.content, status: undefined }));
        }
      }
      update((m) => ({ ...m, status: undefined, content: m.content || "Sorry, I couldn't find an answer. Please call us and we'll help." }));
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        update((m) => ({ ...m, status: undefined, error: true, content: (err as Error).message && (err as Error).message !== "Request failed" ? (err as Error).message : `Sorry — I couldn't connect. Please try again or call ${business.phone.display}.` }));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const suggestions = isVdp(pathname)
    ? ["Tell me about this vehicle", "Is this one 4WD or AWD?", "What would the monthly payment be?", "Show me similar vehicles"]
    : ["Which SUVs do you have?", "Anything under $12,000?", "Do you have a 4x4 truck?", "What are your hours?"];

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => {
            setOpen(true);
            track("assistant_opened", { location: pathname });
          }}
          aria-haspopup="dialog"
          className="fixed right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-navy-900 pl-4 pr-5 text-sm font-semibold text-white shadow-[var(--shadow-overlay)] hover:bg-navy-800 bottom-[calc(5.25rem+var(--tray-h,0px))] lg:bottom-[calc(1.5rem+var(--tray-h,0px))] animate-fade-in"
        >
          <MessageCircle className="size-5" aria-hidden />
          <span className="hidden sm:inline">Ask about our inventory</span>
          <span className="sm:hidden">Ask us</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-up sm:inset-auto sm:bottom-[calc(1.5rem+var(--tray-h,0px))] sm:right-4 sm:h-[min(640px,calc(100dvh-7rem))] sm:w-[400px] sm:rounded-[var(--radius-lg)] sm:border sm:border-line sm:shadow-[var(--shadow-overlay)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line bg-navy-900 px-4 py-3 text-white on-dark sm:rounded-t-[var(--radius-lg)]">
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-lg font-bold leading-tight">
                Ask about our inventory
              </h2>
              <p className="text-xs text-white/75">Automated answers from our current listings</p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    abortRef.current?.abort();
                    setMessages([]);
                    inputRef.current?.focus();
                  }}
                  className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] hover:bg-white/10"
                  aria-label="Start a new conversation"
                  title="New conversation"
                >
                  <RotateCcw className="size-4" aria-hidden />
                </button>
              )}
              <button type="button" onClick={close} className="inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] hover:bg-white/10" aria-label="Close">
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto bg-surface px-3 py-4" aria-live="polite" aria-relevant="additions text" aria-busy={busy}>
            <div className="mb-3 rounded-[var(--radius-md)] border border-line bg-white p-3 text-sm text-slate">
              Hi! Ask me about any vehicle on our site — price, mileage, drivetrain, colors, or what fits your budget. For anything else, call{" "}
              <a href={`tel:${business.phone.e164}`} className="font-semibold text-navy-700 underline underline-offset-2">
                {business.phone.display}
              </a>
              .
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="min-h-10 rounded-full border border-line-strong bg-white px-3 text-left text-sm font-medium text-ink hover:border-navy-900">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <ul className="grid gap-3">
              {messages.map((m) => (
                <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-[var(--radius-md)] rounded-br-[2px] bg-navy-900 px-3 py-2 text-sm text-white"
                        : `max-w-[92%] rounded-[var(--radius-md)] rounded-bl-[2px] border px-3 py-2 text-sm leading-relaxed ${m.error ? "border-[#f1c0bc] bg-danger-soft text-danger" : "border-line bg-white text-ink"}`
                    }
                  >
                    <span className="sr-only">{m.role === "user" ? "You said: " : "Auto Select replied: "}</span>
                    {m.role === "user" ? m.content : <Rich text={m.content} />}
                    {m.status && (
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <Loader2 className="size-3.5 animate-spin" aria-hidden /> {m.status}
                      </span>
                    )}
                    {m.cards && m.cards.length > 0 && <Cards cards={m.cards} />}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={onSubmit} className="border-t border-line bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-b-[var(--radius-lg)]">
            <div className="flex items-end gap-2">
              <label htmlFor="assistant-input" className="sr-only">
                Your question
              </label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={1200}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about a vehicle…"
                className="max-h-32 min-h-11 flex-1 resize-none rounded-[var(--radius-sm)] border border-line-strong px-3 py-2.5 text-sm focus:border-accent-text focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
              <button type="submit" disabled={busy || !input.trim()} className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-navy-900 hover:bg-accent-hover disabled:opacity-50" aria-label="Send">
                {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <SendHorizontal className="size-5" aria-hidden />}
              </button>
            </div>
            <p className="mt-2 text-[0.6875rem] leading-snug text-muted">
              Answers are automated and based on our website listings; please confirm details with our team. Don&apos;t share financial or personal ID information here.{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2">
                Privacy
              </Link>
            </p>
          </form>
        </div>
      )}
    </>
  );
}
