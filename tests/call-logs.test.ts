import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { handleCallLogRequest, matchContactByPhone, type IngestDeps } from "../src/lib/calls/ingest.ts";
import { createFileCallLogStore, queryCalls, type CallLogStore } from "../src/lib/calls/store.ts";
import { parseCallReport } from "../src/lib/calls/parse.ts";

const TOKEN = "test-token-0123456789abcdef";

const vapiReport = (over: Record<string, unknown> = {}) => ({
  message: {
    type: "end-of-call-report",
    endedReason: "customer-ended-call",
    call: {
      id: "call-abc-123",
      assistantId: "asst-1",
      startedAt: "2026-09-19T15:00:00.000Z",
      endedAt: "2026-09-19T15:03:30.000Z",
      customer: { number: "+12105551234" },
    },
    artifact: { transcript: "AI: Thanks for calling Auto Select.\nUser: Do you have the Sprinter?" },
    analysis: {
      summary: "Caller asked about the Sprinter van and wants a callback.",
      structuredData: { vehicleOfInterest: "2019 Mercedes Sprinter", callbackRequested: true, callbackTime: "tomorrow morning" },
    },
    ...over,
  },
});

const post = (body: unknown, headers: Record<string, string> = { authorization: `Bearer ${TOKEN}` }) =>
  new Request("http://localhost/api/integrations/vapi/call-logs", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

let dir: string;
let store: CallLogStore;
let deps: IngestDeps;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "calllogs-"));
  store = createFileCallLogStore(dir);
  deps = { token: TOKEN, store, findContact: async () => null };
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("saving a call report", () => {
  test("a valid Vapi end-of-call-report saves and extracts the documented fields", async () => {
    const res = await handleCallLogRequest(post(vapiReport()), deps);
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), { success: true, call_id: "call-abc-123", duplicate: false });

    const [saved] = await store.list();
    assert.equal(saved.vapiCallId, "call-abc-123");
    assert.equal(saved.callerPhone, "+12105551234");
    assert.equal(saved.assistantId, "asst-1");
    assert.match(saved.transcript ?? "", /Sprinter/);
    assert.equal(saved.summary, "Caller asked about the Sprinter van and wants a callback.");
    assert.equal(saved.endedReason, "customer-ended-call");
    assert.equal(saved.durationSeconds, 210); // derived from the two timestamps
    assert.equal(saved.vehicleInterest, "2019 Mercedes Sprinter");
    assert.equal(saved.callbackRequested, true);
    assert.equal(saved.callbackDetails, "tomorrow morning");
    assert.ok(saved.raw, "raw report is kept for troubleshooting");
  });

  test("accepts the flat shape an n8n Edit Fields node produces", async () => {
    const res = await handleCallLogRequest(
      post({ call_id: "flat-1", caller_number: "(210) 555-9999", summary: "Asked about hours.", transcript: "hi", duration_seconds: 42, outcome: "info_only" }),
      deps,
    );
    assert.equal(res.status, 201);
    const [saved] = await store.list();
    assert.equal(saved.callerPhone, "+12105559999");
    assert.equal(saved.durationSeconds, 42);
    assert.equal(saved.outcome, "info_only");
  });

  test("optional fields can all be missing — and nothing is invented for them", async () => {
    const res = await handleCallLogRequest(post({ message: { type: "end-of-call-report", call: { id: "bare-1" } } }), deps);
    assert.equal(res.status, 201);
    const [saved] = await store.list();
    for (const key of ["callerNumber", "callerPhone", "callerName", "assistantId", "transcript", "summary", "endedReason", "startedAt", "endedAt", "durationSeconds", "outcome", "vehicleInterest", "testDrive", "callbackRequested", "callbackDetails", "contactId"] as const) {
      assert.equal(saved[key], null, `${key} should be null, not guessed`);
    }
  });

  test("a call outcome is never derived — only stored when the report states one", async () => {
    await handleCallLogRequest(post(vapiReport()), deps);
    const [saved] = await store.list();
    assert.equal(saved.outcome, null);
  });

  test("the same call id sent twice creates one record and reports a duplicate", async () => {
    const first = await handleCallLogRequest(post(vapiReport()), deps);
    const retry = await handleCallLogRequest(post(vapiReport({ endedReason: "something-else" })), deps);
    assert.equal(first.status, 201);
    assert.equal(retry.status, 200);
    assert.deepEqual(await retry.json(), { success: true, call_id: "call-abc-123", duplicate: true });
    const all = await store.list();
    assert.equal(all.length, 1);
    assert.equal(all[0].endedReason, "customer-ended-call", "a retry must not overwrite the original record");
  });

  test("concurrent retries of one call still produce exactly one record", async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => handleCallLogRequest(post(vapiReport()), deps)));
    assert.equal(results.filter((r) => r.status === 201).length, 1);
    assert.equal((await store.list()).length, 1);
  });
});

describe("authentication", () => {
  test("no Authorization header is rejected", async () => {
    const res = await handleCallLogRequest(post(vapiReport(), {}), deps);
    assert.equal(res.status, 401);
    assert.equal((await store.list()).length, 0);
  });

  test("a wrong token is rejected", async () => {
    const res = await handleCallLogRequest(post(vapiReport(), { authorization: "Bearer wrong-token-wrong-token" }), deps);
    assert.equal(res.status, 401);
  });

  test("a non-Bearer scheme is rejected", async () => {
    const res = await handleCallLogRequest(post(vapiReport(), { authorization: `Basic ${TOKEN}` }), deps);
    assert.equal(res.status, 401);
  });

  test("the endpoint refuses everything when no token is configured", async () => {
    for (const token of [undefined, "", "short"]) {
      const res = await handleCallLogRequest(post(vapiReport()), { ...deps, token });
      assert.equal(res.status, 503, `token=${JSON.stringify(token)}`);
    }
    assert.equal((await store.list()).length, 0);
  });
});

describe("validation", () => {
  test("a missing call id is rejected", async () => {
    const res = await handleCallLogRequest(post({ message: { type: "end-of-call-report", call: {} } }), deps);
    assert.equal(res.status, 400);
    assert.match(((await res.json()) as { error: string }).error, /call id/i);
  });

  test("other Vapi event types are rejected rather than saved as calls", async () => {
    const res = await handleCallLogRequest(post({ message: { type: "status-update", call: { id: "x1" } } }), deps);
    assert.equal(res.status, 400);
    assert.equal((await store.list()).length, 0);
  });

  test("malformed JSON gets a 400, not a crash", async () => {
    const res = await handleCallLogRequest(post("{not json"), deps);
    assert.equal(res.status, 400);
  });

  test("non-object bodies are rejected", async () => {
    for (const body of ["[]", '"text"', "null", "42"]) assert.equal((await handleCallLogRequest(post(body), deps)).status, 400, body);
  });

  test("hostile field types are handled without throwing", async () => {
    const res = await handleCallLogRequest(
      post({ message: { type: "end-of-call-report", call: { id: "weird-1", customer: { number: { nested: true } }, startedAt: "not a date" }, artifact: { transcript: 12345 }, analysis: { structuredData: "a string" } } }),
      deps,
    );
    assert.equal(res.status, 201);
    const [saved] = await store.list();
    assert.equal(saved.startedAt, null);
    assert.equal(saved.transcript, null);
  });

  test("a call id with unexpected characters is rejected", async () => {
    const res = await handleCallLogRequest(post({ call_id: "bad id; DROP TABLE" }), deps);
    assert.equal(res.status, 400);
  });

  test("oversized bodies are rejected with 413", async () => {
    const res = await handleCallLogRequest(post({ call_id: "big-1", transcript: "x".repeat(1_100_000) }), deps);
    assert.equal(res.status, 413);
  });

  test("HTML in the transcript is stripped before storage", async () => {
    await handleCallLogRequest(post({ call_id: "xss-1", transcript: 'Hi <script>alert(1)</script> there' }), deps);
    const [saved] = await store.list();
    assert.doesNotMatch(saved.transcript ?? "", /<script>/);
  });
});

describe("contact matching", () => {
  const leads = [
    { id: "AS-1", firstName: "Dana", lastName: "Ortiz", phone: "+12105551234", status: "new", createdAt: "2026-09-01T00:00:00Z" },
    { id: "AS-2", firstName: "Dana", lastName: "-", phone: "(210) 555-1234", status: "contacted", createdAt: "2026-09-10T00:00:00Z" },
    { id: "AS-3", firstName: "Spam", lastName: "Bot", phone: "+12105557777", status: "spam", createdAt: "2026-09-11T00:00:00Z" },
  ];

  test("links a caller to the most recent lead with the same normalized phone", () => {
    assert.deepEqual(matchContactByPhone("+12105551234", leads), { contactId: "AS-2", contactName: "Dana" });
  });

  test("never links to spam leads or unknown numbers", () => {
    assert.equal(matchContactByPhone("+12105557777", leads), null);
    assert.equal(matchContactByPhone("+12105550000", leads), null);
    assert.equal(matchContactByPhone("", leads), null);
  });

  test("an existing contact is linked on save, and no contact is created", async () => {
    const res = await handleCallLogRequest(post(vapiReport()), { ...deps, findContact: async (p) => matchContactByPhone(p, leads) });
    assert.equal(res.status, 201);
    const [saved] = await store.list();
    assert.equal(saved.contactId, "AS-2");
    assert.equal(saved.contactName, "Dana");
  });

  test("an unknown caller is saved unlinked", async () => {
    const res = await handleCallLogRequest(post(vapiReport()), deps);
    assert.equal(res.status, 201);
    const [saved] = await store.list();
    assert.equal(saved.contactId, null);
    assert.equal(saved.callerPhone, "+12105551234");
  });

  test("a withheld or non-US number saves without a contact lookup", async () => {
    let lookups = 0;
    const res = await handleCallLogRequest(post({ call_id: "anon-1", caller_number: "anonymous" }), { ...deps, findContact: async () => (lookups++, null) });
    assert.equal(res.status, 201);
    assert.equal(lookups, 0);
  });

  test("a contact-lookup failure doesn't lose the call", async () => {
    const res = await handleCallLogRequest(post(vapiReport()), {
      ...deps,
      findContact: async () => {
        throw new Error("leads file unreadable");
      },
    });
    assert.equal(res.status, 201);
    assert.equal((await store.list()).length, 1);
  });
});

describe("failures", () => {
  test("a database failure returns a safe 500 that leaks nothing", async () => {
    const failing: CallLogStore = {
      ...store,
      save: async () => {
        throw new Error("ENOSPC: secret transcript text and /var/www/path");
      },
    };
    const logged: unknown[][] = [];
    const original = console.error;
    console.error = (...a: unknown[]) => void logged.push(a);
    let res: Response;
    try {
      res = await handleCallLogRequest(post(vapiReport()), { ...deps, store: failing });
    } finally {
      console.error = original;
    }
    assert.equal(res.status, 500);
    const text = await res.text();
    assert.doesNotMatch(text, /ENOSPC|transcript|\/var\/www/);
    assert.doesNotMatch(JSON.stringify(logged), /Sprinter|ENOSPC|transcript text/, "server logs must not contain call content");
  });

  test("a corrupt line in the store doesn't break reads", async () => {
    await handleCallLogRequest(post(vapiReport()), deps);
    const file = path.join(dir, "call-logs.ndjson");
    await writeFile(file, (await readFile(file, "utf8")) + "{corrupt\n");
    assert.equal((await store.list()).length, 1);
  });
});

describe("dashboard queries", () => {
  test("search, date, outcome filters and pagination", async () => {
    const mk = (id: string, num: string, when: string, outcome?: string) => handleCallLogRequest(post({ call_id: id, caller_number: num, started_at: when, outcome }), deps);
    await mk("q1", "+12105551111", "2026-09-10T10:00:00Z", "test_drive");
    await mk("q2", "+12105552222", "2026-09-12T10:00:00Z", "info_only");
    await mk("q3", "+12105553333", "2026-09-15T10:00:00Z");
    const all = await store.list();

    assert.deepEqual(all.map((c) => c.vapiCallId), ["q3", "q2", "q1"], "newest first");
    assert.deepEqual(queryCalls(all, { q: "555-2222" }).items.map((c) => c.vapiCallId), ["q2"]);
    assert.deepEqual(queryCalls(all, { from: "2026-09-11", to: "2026-09-14" }).items.map((c) => c.vapiCallId), ["q2"]);
    assert.deepEqual(queryCalls(all, { outcome: "test_drive" }).items.map((c) => c.vapiCallId), ["q1"]);
    const p = queryCalls(all, { pageSize: 2, page: 2 });
    assert.equal(p.pageCount, 2);
    assert.deepEqual(p.items.map((c) => c.vapiCallId), ["q1"]);
    assert.equal(queryCalls(all, { page: 99 }).page, 1, "out-of-range page is clamped");
  });
});

describe("parser", () => {
  test("only end-of-call-report or unlabelled flat bodies are accepted", () => {
    assert.equal(parseCallReport({ call_id: "ok-1" }).ok, true);
    assert.equal(parseCallReport({ message: { type: "transcript", call: { id: "x" } } }).ok, false);
  });
});
