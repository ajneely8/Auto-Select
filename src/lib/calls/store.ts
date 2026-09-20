import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { CallLog, ParsedCall } from "./types.ts";

/**
 * Call-log storage, following the same approach as the lead store (see src/lib/crm/store/file.ts):
 * an append-only NDJSON file under the data directory, with every write serialized through an
 * in-process queue. This project has no database, and the brief was not to introduce a second
 * one — a single PM2 process is the only writer, which is exactly what this is safe for.
 *
 * `vapiCallId` is the idempotency key: saving a call that already exists returns the existing
 * record and never overwrites it, so an n8n retry can't create a duplicate or clobber data.
 */

const MAX_RAW_BYTES = 300_000;

export interface SaveResult {
  duplicate: boolean;
  call: CallLog;
}

export interface CallLogStore {
  /** Saves once per Vapi call id. `match` is the CRM contact the caller was linked to, resolved by the caller beforehand. */
  save(parsed: ParsedCall, raw: unknown, match: { contactId: string; contactName: string } | null): Promise<SaveResult>;
  list(): Promise<CallLog[]>;
  get(id: string): Promise<CallLog | null>;
}

const newId = () => `CL-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

/** Keeps the stored raw report bounded so one huge payload can't bloat the file. */
function capRaw(raw: unknown): unknown {
  try {
    const s = JSON.stringify(raw);
    if (s !== undefined && s.length <= MAX_RAW_BYTES) return raw;
    return { truncated: true, originalBytes: s?.length ?? 0 };
  } catch {
    return { truncated: true };
  }
}

export function createFileCallLogStore(dir: string): CallLogStore {
  const file = () => path.join(dir, "call-logs.ndjson");
  let chain: Promise<unknown> = Promise.resolve();
  const locked = <T>(fn: () => Promise<T>): Promise<T> => {
    const run = chain.then(fn, fn);
    chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };

  async function readAll(): Promise<CallLog[]> {
    let raw: string;
    try {
      raw = await fs.readFile(file(), "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
    const out: CallLog[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        out.push(JSON.parse(line) as CallLog);
      } catch {
        // One corrupt line shouldn't take the whole dashboard down.
      }
    }
    return out;
  }

  return {
    save: (parsed, raw, match) =>
      locked(async () => {
        const existing = (await readAll()).find((c) => c.vapiCallId === parsed.vapiCallId);
        if (existing) return { duplicate: true, call: existing };

        const call: CallLog = {
          ...parsed,
          id: newId(),
          contactId: match?.contactId ?? null,
          contactName: match?.contactName ?? null,
          raw: capRaw(raw),
          createdAt: new Date().toISOString(),
        };
        await fs.mkdir(dir, { recursive: true });
        await fs.appendFile(file(), JSON.stringify(call) + "\n", { mode: 0o600 });
        return { duplicate: false, call };
      }),
    list: async () => (await readAll()).sort((a, b) => (b.startedAt ?? b.createdAt).localeCompare(a.startedAt ?? a.createdAt)),
    get: async (id) => (await readAll()).find((c) => c.id === id) ?? null,
  };
}

export interface CallQuery {
  q?: string;
  outcome?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface CallPage {
  items: CallLog[];
  total: number;
  page: number;
  pageCount: number;
}

/** Search / filter / paginate. Newest first (the store already sorts). */
export function queryCalls(all: CallLog[], query: CallQuery): CallPage {
  const q = (query.q ?? "").trim().toLowerCase();
  const qDigits = q.replace(/\D/g, "");
  const from = query.from ? `${query.from}T00:00:00.000Z` : null;
  const to = query.to ? `${query.to}T23:59:59.999Z` : null;

  const filtered = all.filter((c) => {
    const when = c.startedAt ?? c.createdAt;
    if (from && when < from) return false;
    if (to && when > to) return false;
    if (query.outcome && (c.outcome ?? "") !== query.outcome) return false;
    if (!q) return true;
    if ((c.callerName ?? c.contactName ?? "").toLowerCase().includes(q)) return true;
    return qDigits.length >= 3 && (c.callerNumber ?? "").replace(/\D/g, "").includes(qDigits);
  });

  const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 100);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(query.page ?? 1, 1), pageCount);
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageCount };
}
