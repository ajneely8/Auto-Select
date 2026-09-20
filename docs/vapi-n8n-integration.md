# Vapi AI receptionist → n8n → CRM call logs

Flow: **Vapi** (end-of-call report) → **n8n Webhook** → **n8n HTTP Request** → `POST /api/integrations/vapi/call-logs` → CRM storage → **CRM → Call logs**.

## Values you must set yourself

| Value | Where | Notes |
|---|---|---|
| `ATARO_CRM_API_TOKEN` | CRM server env (`.env.local` on the VPS) | At least 16 characters. Generate: `openssl rand -hex 32`. Restart the app after setting. If unset/short the endpoint returns **503** and accepts nothing. |
| `MY-CRM-DOMAIN` | n8n HTTP Request URL | Your deployed CRM host. Not filled in here on purpose. |
| Token copy | n8n credential | Same value as `ATARO_CRM_API_TOKEN`, stored as an n8n credential (never pasted into a node's fields or the workflow JSON). |

## Endpoint

`POST https://MY-CRM-DOMAIN/api/integrations/vapi/call-logs`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`. Body limit 1 MB.

| Status | Meaning |
|---|---|
| 201 `{"success":true,"call_id":"…","duplicate":false}` | Saved |
| 200 `{"success":true,"call_id":"…","duplicate":true}` | Retry of a call already saved; nothing changed |
| 400 | Invalid JSON, missing/invalid call ID, or not an `end-of-call-report` |
| 401 | Missing or wrong token |
| 413 | Body too large |
| 500 | Storage failure (safe message; transcript never logged) |
| 503 | Token not configured on the server |

The Vapi call ID is the idempotency key. n8n retries are safe.

## n8n workflow

**Node 1 – Webhook**: HTTP Method `POST`, Path `vapi-call-report`, Respond `Immediately`. Use the **Production URL** (not the Test URL) in Vapi.

**Node 2 – IF**: Condition (String) `{{ $json.body.message.type }}` **is equal to** `end-of-call-report`. Connect only the **true** output onward.

**Node 3 – Edit Fields (Set)**, mode Manual Mapping, these fields (leave a field empty rather than inventing a value; the CRM stores missing data as "not recorded"):

| Field | Expression |
|---|---|
| `call_id` | `{{ $json.body.message.call.id }}` |
| `caller_number` | `{{ $json.body.message.call.customer.number }}` |
| `caller_name` | `{{ $json.body.message.call.customer.name }}` |
| `assistant_id` | `{{ $json.body.message.call.assistantId }}` |
| `transcript` | `{{ $json.body.message.artifact.transcript }}` |
| `summary` | `{{ $json.body.message.analysis.summary }}` |
| `ended_reason` | `{{ $json.body.message.endedReason }}` |
| `started_at` | `{{ $json.body.message.call.startedAt }}` |
| `ended_at` | `{{ $json.body.message.call.endedAt }}` |

Optional, only if your Vapi assistant's structured-data plan returns them (`{{ $json.body.message.analysis.structuredData.<key> }}`): `vehicle_interest`, `test_drive`, `callback_requested`, `callback_details`, `outcome`. Add `type` = `end-of-call-report` if you send this flat shape.

**Node 4 – HTTP Request**: Method `POST`; URL `https://MY-CRM-DOMAIN/api/integrations/vapi/call-logs`; Authentication `Generic Credential Type` → `Header Auth` (create credential: Name `Authorization`, Value `Bearer MY_SECRET_TOKEN`); Send Body on, Body Content Type `JSON`, Specify Body `Using Fields Below` or JSON `{{ $json }}`; Send Headers `Content-Type: application/json`. Turn on **Retry On Fail** (3 tries).

Alternative: skip Node 3 and send Vapi's original body straight through; the CRM also accepts the raw `{ "message": { … } }` envelope.

## Vapi setup

Assistant → **Server URL** = the n8n **Production** webhook URL; enable the `end-of-call-report` server message. Activate the workflow (toggle top-right in n8n) — a workflow that is not Active does not receive production calls.

**Payload caveat:** the CRM reads the standard envelope (`message.call.id`, `message.endedReason`, `message.artifact.transcript`) and tries several likely paths for the rest (summary, timestamps, structured data). Exact paths for `analysis` and timestamps were not confirmed against a real call. After your first real call, open it in Call logs → *Raw Vapi report* and confirm the mapped fields; adjust Node 3 if any are empty.

The CRM never guesses: outcome, vehicle and callback fields stay "Not recorded" unless the report states them.

## Test it

Unauthorized (expect 401):
```bash
curl -i -X POST https://MY-CRM-DOMAIN/api/integrations/vapi/call-logs -H "Content-Type: application/json" -d '{}'
```
Authorized test (expect 201, then 200 with `duplicate:true` on repeat). Use an obviously-test call ID and delete the test line afterwards if you don't want it in the dashboard:
```bash
curl -i -X POST https://MY-CRM-DOMAIN/api/integrations/vapi/call-logs \
  -H "Authorization: Bearer $ATARO_CRM_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"message":{"type":"end-of-call-report","endedReason":"customer-ended-call","call":{"id":"test-call-001","customer":{"number":"+15555550123"}},"artifact":{"transcript":"AI: Thanks for calling.\nUser: Test."}}}'
```
Then open **CRM → Call logs**. In n8n, use **Execute workflow** with a pinned sample before making a real call.

## Data handling

- Calls are stored in `.data/call-logs.ndjson` on the CRM server (file mode 600, git-ignored), the same storage approach as leads; no second database. Back it up with `.data/leads`. This is durable on the VPS but **not** on serverless hosts with ephemeral disks.
- Transcripts and raw reports (capped at 300 KB) are visible only to signed-in CRM users. They are never written to server logs; error logs contain only the error class.
- To purge, delete the relevant line(s) from the file; there is no automatic retention limit yet.
- Callers are linked to a CRM lead only on an exact normalized phone match; existing lead data is never modified, and unknown callers are saved unlinked.

## Tests

`npm test` runs `tests/call-logs.test.ts` (auth, validation, idempotency, contact matching, failure handling, dashboard queries).
