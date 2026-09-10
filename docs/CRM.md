# Internal CRM (/crm)

A private, login-gated dashboard over the lead store — every inventory, financing, trade-in,
vehicle-locator, delivery, service, service-contract, appointment, and contact form submitted on
the website, in one place. Not a page anyone browsing the site can find: it isn't linked from the
header, footer, or sitemap, and it's excluded from `robots.txt` and marked `noindex`.

That said, hiding the URL is not what protects it — a real login does. Anyone who guesses or is
told the `/crm` URL sees a sign-in form, not the data; getting past it requires the actual email
and password.

## Setting it up

The CRM refuses every login attempt until three environment variables are all set — there is no
default account and no way to fail open.

1. Generate your credentials:
   ```bash
   npm run crm:create-user -- you@yourdealership.com "a long, unique password"
   ```
   This prints `CRM_ADMIN_EMAIL` and `CRM_ADMIN_PASSWORD_HASH`. The password itself is never
   stored anywhere — only a salted hash (Node's `scrypt`).
2. Generate a session secret: `openssl rand -hex 32` → `CRM_SESSION_SECRET`.
3. Put all three in `.env.local` (development) or your host's environment variables (production).
   Restart the server after changing them. **On Netlify, also set `LEAD_STORE=netlify-blobs`** — see
   the durability note below; without it, leads are stored in a file that Netlify does not keep
   between deploys.
4. Sign in at `/crm/login`.

Only one admin account is supported. To change the password, run `crm:create-user` again with a
new password and update `CRM_ADMIN_PASSWORD_HASH`.

## What's in it

- **`/crm`** — every lead, newest first, with counts by status. Search by name, email, phone, or
  vehicle; filter by form type and status. Change a lead's status (New / Contacted / Qualified /
  Closed / Spam) right from the list or the detail page — it's saved immediately.
- **`/crm/leads/[id]`** — everything that specific form submission captured: contact info, the
  vehicle involved (linked to its live listing), every field specific to that form type (trade-in
  year/mileage/condition/payoff, financing topic, delivery address, desired vehicle specs, service
  type — whatever that form collects), trade-in photos, and where the lead came from (page,
  referrer, UTM tags).

Nothing is summarized or dropped — if a customer typed it into a form, it's on that lead's page.

## How it's built

- **Auth**: one admin account from environment variables, `scrypt` password hashing, a signed
  (HMAC-SHA256), httpOnly, 12-hour session cookie scoped to `/crm`. Login is rate-limited (8
  attempts per IP per 15 minutes) and returns the same generic error either way, so a wrong
  password can't be distinguished from a wrong email.
- **Data**: reads and rewrites the same `<LEAD_DATA_DIR>/leads.ndjson` file every form already
  writes to (see `src/lib/leads/store.ts`). No separate database — the CRM is a view over the
  existing lead store, not a second copy of it.
- **Photos**: trade-in photos are served through an authenticated route
  (`/crm/leads/[id]/photos/[file]`) that re-checks the session on every request and confines the
  requested file to that one lead's own upload folder — not a public path under `public/`.

## Durability note (same caveat as the rest of the file-based lead store)

With `LEAD_STORE=file` (the default), status changes rewrite the whole `leads.ndjson` file. That's
simple and fine for a single small-business instance on a VPS or local dev, but it is not safe for
concurrent writers and the file itself is not durable on serverless hosting (a fresh deploy or a
cold instance won't have yesterday's edits).

**On Netlify, set `LEAD_STORE=netlify-blobs` instead.** The CRM and every form then read and write
through Netlify's built-in Blobs store (`src/lib/crm/store/blobs.ts` and the matching branch in
`src/lib/leads/store.ts`), which persists across deploys and instances — no extra account, database,
or setup beyond the environment variable. Each lead lives in its own blob keyed by id, so a status
change or note only touches that one record instead of rewriting everything.

If you outgrow file-based storage in a different way — very high lead volume, or you move off
Netlify to a different serverless host — replace `src/lib/crm/store/*` and `src/lib/leads/store.ts`
with a real database (Postgres, Supabase, Airtable) behind the same `CrmLeadStore`/`LeadStore`
interfaces. See [DEPLOYMENT.md](DEPLOYMENT.md#serverless-storage-note-important) for the broader
version of this same caveat.

## If you ever suspect the CRM was accessed by someone who shouldn't have it

Run `npm run crm:create-user` again with a new password, update `CRM_ADMIN_PASSWORD_HASH`, and
rotate `CRM_SESSION_SECRET` too (this immediately invalidates every existing session, including
your own — you'll need to sign in again).
