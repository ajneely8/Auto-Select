import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { dataDir } from "@/lib/data-dir";

/**
 * First-party pageview counter for the CRM's "Website traffic" section — no cookies, no third
 * party. Stores aggregate counts only (by calendar day and by path), not individual visit
 * records, so the file stays small no matter how much traffic the site gets.
 */
export interface PageviewData {
  byDay: Record<string, number>;
  byPath: Record<string, number>;
}

let chain: Promise<unknown> = Promise.resolve();
function withPageviewsFileLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(() => undefined, () => undefined);
  return run;
}

function filePath() {
  return path.join(dataDir(), "pageviews.json");
}

async function readData(): Promise<PageviewData> {
  try {
    const raw = await fs.readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw);
    return { byDay: parsed.byDay ?? {}, byPath: parsed.byPath ?? {} };
  } catch {
    return { byDay: {}, byPath: {} };
  }
}

/** Increments today's total and this path's total. Safe to call from a fire-and-forget beacon endpoint. */
export async function recordPageview(pathname: string): Promise<void> {
  await withPageviewsFileLock(async () => {
    const data = await readData();
    const today = new Date().toISOString().slice(0, 10);
    data.byDay[today] = (data.byDay[today] ?? 0) + 1;
    data.byPath[pathname] = (data.byPath[pathname] ?? 0) + 1;
    await fs.mkdir(dataDir(), { recursive: true });
    await fs.writeFile(filePath(), JSON.stringify(data), { mode: 0o600 });
  });
}

export async function loadPageviewData(): Promise<PageviewData> {
  return readData();
}
