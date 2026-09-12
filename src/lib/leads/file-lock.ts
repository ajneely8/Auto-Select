import "server-only";

/**
 * In-process mutex serializing every read-modify-write against leads.ndjson.
 *
 * Without this, a new lead landing (an append) can race a status/note/delete change (a full
 * read-then-rewrite): the rewrite's `listLeads()` snapshot is taken before the append lands, and
 * its write — which replaces the whole file — then overwrites and permanently erases that new
 * lead. Confirmed happening live: leads present moments earlier vanished from leads.ndjson after
 * an unrelated CRM action. A single PM2 process still runs these on the same event loop, so
 * chaining every writer through one promise queue closes the race with no locking library needed.
 */
let chain: Promise<unknown> = Promise.resolve();

export function withLeadsFileLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
