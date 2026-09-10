# Architecture

Developer reference for the Auto Select site. For routes see [SITEMAP.md](SITEMAP.md); for hosting see [DEPLOYMENT.md](DEPLOYMENT.md).

## Principles

- **One source of truth per concern.** Business facts: `src/config/business.ts`. Inventory: the repository in `src/lib/inventory/repository.ts`. Every lead: `src/lib/leads/pipeline.ts`. Environment: `src/config/env.ts`.
- **Provider-neutral adapters.** Inventory (local file or JSON feed), lead storage (file or none), email/SMS/CRM/scheduling (signed webhooks), shopper storage (localStorage) each sit behind a small interface so a real provider can be swapped in without touching pages.
- **Works with nothing configured.** Every integration defaults to "log only". No database, no paid API is required to run the site.
- **Server first.** Pages are React Server Components that read data directly. Client components are used only where the browser is needed, and receive trimmed data.
- **Never overstate.** No confirmation without a provider saying so, no rates as offers, no facts the data doesn't contain (enforced in the assistant, the forms' success messages, and the content files).

## Folder structure

Generated from the working tree (excluding `node_modules`, `.next`, `.data`).

```
auto-select/
├── data/
│   ├── inventory-template.csv        CSV columns for npm run inventory:import
│   └── inventory.json                Local inventory (meta + vehicles); bundled at build time
├── docs/                             This documentation
├── public/
│   ├── 360/
│   │   └── demo/
│   │       └── frame-01.svg … frame-36.svg   Rendered demo 360 sequence (development only)
│   └── brand-logo.png
├── scripts/
│   ├── check-inventory.mjs           npm run inventory:check
│   ├── generate-demo-360.mjs         npm run generate:demo-360
│   └── import-inventory.mjs          npm run inventory:import
├── src/
│   ├── app/
│   │   ├── _legal/LegalDocument.tsx  Shared layout for privacy/terms (private folder, not a route)
│   │   ├── about/page.tsx
│   │   ├── actions/leads.ts          submitLead server action (all lead forms)
│   │   ├── api/
│   │   │   ├── assistant/route.ts    POST, NDJSON stream
│   │   │   ├── cron/reminders/route.ts
│   │   │   ├── cron/retry/route.ts
│   │   │   ├── inventory/sync/route.ts
│   │   │   ├── vehicles/route.ts
│   │   │   └── webhooks/scheduling/route.ts
│   │   ├── blog/[slug]/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── compare/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── delivery/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── financing/page.tsx
│   │   ├── find-a-vehicle/page.tsx
│   │   ├── inventory/[slug]/page.tsx
│   │   ├── inventory/loading.tsx
│   │   ├── inventory/page.tsx
│   │   ├── privacy-policy/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── saved/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── service-contracts/page.tsx
│   │   ├── services/page.tsx
│   │   ├── terms-of-use/page.tsx
│   │   ├── trade-in/page.tsx
│   │   ├── unsubscribe/{actions.ts, page.tsx, UnsubscribeForm.tsx}
│   │   ├── error.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css               Design tokens (Tailwind 4 @theme)
│   │   ├── layout.tsx                Root layout, fonts, global widgets, AutoDealer JSON-LD
│   │   ├── not-found.tsx
│   │   ├── page.tsx                  Home
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── assistant/InventoryAssistant.tsx
│   │   ├── contact/MapEmbed.tsx
│   │   ├── forms/                    AppointmentForm, ContactForm, DeliveryForm, fields, FinancingInquiryForm,
│   │   │                             FormShell, ServiceContractQuoteForm, ServiceRequestForm, SlotPicker,
│   │   │                             TradeInForm, VehicleLocatorForm
│   │   ├── home/QuickSearch.tsx
│   │   ├── inventory/                AlertSignup, CompareTray, FilterPanel, InventoryExplorer, VehicleActions, VehicleCard
│   │   ├── layout/                   ConsentBanner, FloatingControls, Footer, Header, UtilityBar
│   │   ├── seo/                      Breadcrumbs, JsonLd
│   │   ├── shopping/                 CompareTable, SavedList
│   │   ├── ui/                       Badge (+ TodoFlag), Button, Reveal, Section
│   │   └── vehicle/                  LeadCard, PaymentCalculator, PhotoGallery, Vehicle360Viewer,
│   │                                 VehicleClientBits, VehicleMedia
│   ├── config/
│   │   ├── business.ts               Business facts (name, NAP, hours, financing, social)
│   │   ├── env.ts                    Zod-validated server environment (server-only)
│   │   └── site.ts                   siteUrl, navigation, showDemo360
│   ├── content/                      blog.ts, faq.ts, reviews.ts, team.ts
│   └── lib/
│       ├── assistant/                cards, claude, local-engine, prompt, tools, types
│       ├── automation/subscriptions.ts
│       ├── integrations/             index.ts (webhook adapters), retry-queue.ts
│       ├── inventory/                filters, health, repository, schema, summary
│       ├── leads/                    form-state, pipeline, sanitize, schemas, spam, store
│       ├── media/frames.ts           360 frame loader
│       ├── scheduling/               hours.ts, provider.ts
│       ├── shopping/                 store.ts (localStorage), useVehicleSummaries.ts
│       ├── analytics.ts
│       ├── cron-auth.ts
│       ├── data-dir.ts               Resolves LEAD_DATA_DIR for file adapters
│       ├── finance.ts
│       ├── format.ts
│       ├── seo.ts                    Metadata + JSON-LD builders
│       └── types.ts                  Vehicle, Lead, TradeIn, Appointment, BusinessInformation, …
├── .env.example
├── eslint.config.mjs
├── next.config.ts                    Security headers, image hosts, redirects, Server Action body limit
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json                     Paths: @/* → src/*, @data/* → data/*
└── vercel.json                       Cron schedules
```

Runtime-only (git-ignored): `.data/` holds `leads.ndjson`, `uploads/<leadId>/…`, `retry-queue.json`, `dead-letter.ndjson`, `subscriptions.json` when the file adapters are in use.

## Server and client components

| Server components (default) | Client components (`"use client"`) |
| --- | --- |
| All `page.tsx` files, `layout.tsx`, `Footer`, `UtilityBar`, `Section`/`PageHero`, `Button`, `Badge`, `Breadcrumbs`, `JsonLd`, `VehicleCard` (shared: rendered on the server and inside client lists) | `Header` (scroll state, mobile menu dialog, saved count), `InventoryExplorer`, `FilterPanel`, `VehicleActions`, `CompareTray`, `AlertSignup`, `QuickSearch`, every form component, `SlotPicker`, `LeadCard`, `PaymentCalculator`, `PhotoGallery`, `VehicleMedia`, `Vehicle360Viewer`, `VehicleClientBits`, `CompareTable`, `SavedList`, `MapEmbed`, `InventoryAssistant`, `ConsentBanner`, `FloatingControls`, `Reveal` |

Rules:

- Anything that touches secrets, the filesystem, or the inventory source imports `server-only` (`env.ts`, `repository.ts`, `pipeline.ts`, `store.ts`, `spam.ts`, `integrations/*`, `subscriptions.ts`, `cron-auth.ts`, `assistant/*` except `cards.ts` and `types.ts`).
- Vehicles cross to the client as `VehicleSummary` (`src/lib/inventory/summary.ts`): description, `internalNotes`, and 360 frames are removed and photos are cut to two, plus `photoCount` and `has360`. The vehicle page passes individual props (photos, frames, ids) to client components, never the whole record, so `internalNotes` never reaches the browser.
- Isomorphic modules (no server imports) are shared both ways: `inventory/filters.ts`, `scheduling/hours.ts`, `finance.ts`, `format.ts`, `leads/schemas.ts`, `leads/sanitize.ts`, `media/frames.ts`, `analytics.ts`.

## Inventory data flow

```
data/inventory.json ─────────┐   (INVENTORY_SOURCE=local, default; imported at build time)
INVENTORY_FEED_URL (+token) ─┤   (INVENTORY_SOURCE=feed; fetch cached with tag "inventory",
                             │    revalidate INVENTORY_REVALIDATE_SECONDS; falls back to the local file on error)
                             ▼
      repository.loadRaw()  →  schema.normalizeVehicle() (Zod: validates, fills id/slug/alt text)
                             ▼
      getAllVehicles()  (React cache per request; invalid records logged and skipped; duplicate slugs dropped)
        ├─ getPublishedVehicles()  status !== "sold"
        ├─ getVehicleBySlug() / getVehicleById()  (id, stock number, or slug)
        ├─ getFeaturedVehicles(n)  featured flag first, then newest with a price and ≥ 8 photos
        └─ getSimilarVehicles(v, n) same body style, then closest price
                             ▼
  Consumers
  ├─ /                 hero vehicle, featured cards, quick-search options
  ├─ /inventory        published → toSummary → InventoryExplorer (client-side filtering)
  ├─ /inventory/[slug] detail page (pre-rendered via generateStaticParams), vehicleJsonLd, similar vehicles
  ├─ /schedule, /delivery   ?vehicle= lookups (published only)
  ├─ /sitemap.xml      published vehicles + first 5 photo URLs
  ├─ /api/vehicles     summaries for saved / compare / recently viewed
  ├─ /api/assistant    search_inventory, get_vehicle_details, show_vehicle_cards tools + local engine
  ├─ /api/cron/reminders    matching for search alerts and price changes
  ├─ lead pipeline     vehicle label + stock number on every vehicle lead
  └─ /api/inventory/sync    revalidateTag("inventory") + revalidatePath("/", "layout"), then inventoryHealth()
```

Notes:

- **Sold = unpublished.** Sold vehicles vanish from listings, featured, search, the sitemap, the assistant, and `/api/vehicles`. Their detail URL still resolves, with a sold banner, `noindex`, and similar vehicles.
- **Local source is bundled.** `data/inventory.json` is imported as a module, so editing it requires a rebuild/redeploy. The sync endpoint only refreshes data from a feed.
- **Feed format.** A JSON array, or `{ "vehicles": [...] }`, of objects in the `Vehicle` shape (`src/lib/types.ts`). Photos may be URL strings or `{ url, alt?, width?, height? }`. Missing `id`/`slug` are derived from the stock number. Validation rules are in `src/lib/inventory/schema.ts`.
- **Quality checks.** `inventoryHealth()` (`src/lib/inventory/health.ts`) flags missing price, no/low photos (< 8), short description (< 120 characters), no trim, no features, no MPG, duplicate stock numbers, unsupported 360 frame counts, and demo 360 use. The same rules are mirrored in `scripts/check-inventory.mjs` and `scripts/import-inventory.mjs`.

## URL-synced inventory filters

`src/lib/inventory/filters.ts` is the only place filters are defined, and it runs on both server and client.

- `parseFilters(URLSearchParams | searchParams)` → `InventoryFilters`; `serializeFilters()` → query string. Param names: `q`, list params (`condition`, `make`, `model`, `body`, `fuel`, `transmission`, `drivetrain`, `exterior`, `interior`, `feature`, `availability`, comma-separated, max 30 values), ranges (`year_min`, `year_max`, `price_min`, `price_max`, `miles_max`), `sort`.
- Matching: OR within a group, AND across groups; `feature` requires all selected features. Keyword search matches every term against year, make, model, trim, body, colors, fuel, drivetrain, engine, stock number, VIN, and features. Price filters and sorting use `displayPrice()` (sale price when lower).
- `computeFacets()` counts each option as if that group's own selection were removed, so counts show what adding an option would return; options with zero results stay visible. Model options narrow to the selected makes.
- `InventoryExplorer` treats the URL as state: filter clicks `pushState` (back/forward works), sort and keyword typing `replaceState` (keyword debounced 300ms). On load it normalizes the URL (drops empty params from the homepage quick-search GET form). Result counts are announced through a polite live region.
- The same filter functions drive saved searches (the saved query string), inventory alerts (`/api/cron/reminders` re-parses the stored query), and the assistant's search tool.

## Lead pipeline

Every form posts to one server action, `submitLead` (`src/app/actions/leads.ts`), which reads the hidden `_formType` field and the client IP (`x-forwarded-for`, then `x-real-ip`), and calls `processLead()` in `src/lib/leads/pipeline.ts`.

```
Browser form (FormShell)
  hidden: _formType, _startedAt, company_website (honeypot), _sourcePage, _referrer, utm_* (from sessionStorage)
  client-side validation (native constraints + friendly messages)
        │  Server Action (FormData)
        ▼
 1. Sanitize        formDataToRecord(): strip control chars and HTML tags, trim, cap lengths
 2. Spam            honeypot filled │ submitted < 2.5 s after render │ > 3 links in message/notes
                    → pretend success, log, stop
                    Turnstile check (only if TURNSTILE_SECRET_KEY is set)
 3. Rate limit      6 submissions per IP per 10 minutes, all forms combined (in-memory)
 4. Validate        contactFields (or email-only for alerts) + typeSchemas[type] (Zod)
                    + appointment slot check (validateSlot) + trade-in photo checks (≤ 6, ≤ 8 MB, JPG/PNG/WebP/HEIC)
                    → field errors returned inline
 5. Dedupe          SHA-256 of type, email, phone, vehicle, message, date, time; same within 10 min
                    → return the original reference, stop
 6. Build lead      id "AS-<base36 time>-<hex>", vehicle label + stock number, UTM, source page, referrer
 7. Schedule        test-drive / appointment → scheduling provider → "confirmed" only if provider says so
 8. Store           leadStore.save() (+ trade-in uploads); failures are logged and do not stop delivery
 9. Subscribe       inventory-alert → addSubscription()
10. Deliver         in parallel (Promise.allSettled):
                      internal email  → LEAD_NOTIFY_EMAIL or business.email (reply-to = customer)
                      customer email  → confirmation with reference number
                      SMS             → only if a phone was given and smsConsent is true
                      CRM             → { event: "lead.created", lead }
                    each failure → retry queue
11. Respond         success message per type (appointments say "not confirmed yet" unless confirmed)
```

Lead types and their schemas are in `src/lib/leads/schemas.ts`. Financial and identifying fields (`payoffAmount`, `monthlyMin`, `monthlyMax`, `budget`, `vin`, `vinOrPlate`) are listed in `SENSITIVE_FIELDS` and are left out of email notifications, which instead say the details are in the CRM or lead store. The CRM payload carries the full lead.

Storage adapters (`src/lib/leads/store.ts`, `LEAD_STORE`):

- `file` (default): appends one JSON line per lead to `<LEAD_DATA_DIR>/leads.ndjson` (mode 0600); trade-in photos go to `<LEAD_DATA_DIR>/uploads/<leadId>/`. Not served publicly.
- `none`: stores nothing locally; use with `CRM_WEBHOOK_URL`.
- To use a database, implement the `LeadStore` interface (`save`, `saveUpload`).

Rate-limit and dedupe state are in memory, so they reset on restart and are per instance. Use a shared store (Redis/Upstash) for multi-instance hosting.

## Integrations and webhook contracts

`src/lib/integrations/index.ts`. No email or SMS provider is bundled: each adapter POSTs JSON to a URL you control (Zapier, Make, n8n, a CRM inbound webhook, or a small function that calls Resend, Postmark, Twilio, etc.). Unset URL = log only.

### Request format (all outbound webhooks)

```
POST <URL>
Content-Type: application/json
X-AutoSelect-Integration: email | sms | crm | scheduling
X-AutoSelect-Signature: sha256=<hex HMAC-SHA256 of the raw body, key WEBHOOK_SIGNING_SECRET>
```

The signature header is an empty string when `WEBHOOK_SIGNING_SECRET` is unset. Timeout is 8 seconds; any non-2xx response or timeout is a failure.

Verifying on the receiving side (Node):

```js
import { createHmac, timingSafeEqual } from "node:crypto";
const expected = Buffer.from("sha256=" + createHmac("sha256", process.env.WEBHOOK_SIGNING_SECRET).update(rawBody).digest("hex"));
const given = Buffer.from(req.headers["x-autoselect-signature"] ?? "");
const ok = expected.length === given.length && timingSafeEqual(expected, given);
```

### Payloads

| Env var | Payload | Sent when |
| --- | --- | --- |
| `EMAIL_WEBHOOK_URL` | `{ "from": "Auto Select <info@autoselectgroups.com>", "to": "…", "subject": "…", "text": "…", "replyTo"?: "…", "tags"?: ["lead","trade-in"] }` (`from` = `EMAIL_FROM` or business name/email; `html` is supported by the type but no caller sets it) | Internal lead notice (`tags: ["lead", type]`), customer confirmation (`["confirmation", type]`), alert emails (`["alert","search"]`, `["alert","vehicle"]`), appointment updates (`["appointment", status]`) |
| `SMS_WEBHOOK_URL` | `{ "to": "+12105551234", "body": "Auto Select: we received your … Msg & data rates may apply. Reply STOP to opt out, HELP for help." }` | Lead confirmation and appointment updates, only with SMS consent |
| `CRM_WEBHOOK_URL` | `{ "event": "lead.created", "lead": Lead }` (full `Lead` from `src/lib/types.ts`, including `details`, UTM data, consent flags, `sourcePage`) | Every accepted lead |
| `SCHEDULING_WEBHOOK_URL` | `SchedulingRequest`: `{ "kind", "date": "YYYY-MM-DD", "time": "HH:MM", "timezone": "America/Chicago", "vehicleId", "leadId", "customer": { "firstName", "lastName", "email", "phone" } }`. Respond with `{ "confirmed": true, "reference": "…" }` to confirm. | Test-drive and appointment requests (no retry; any failure = "requested") |

### Inbound: `POST /api/webhooks/scheduling`

Called by your scheduling tool or CRM when staff confirm, reschedule, or cancel. Sign the raw body the same way (`X-AutoSelect-Signature`).

```json
{
  "leadId": "AS-M1ABCDEF-1A2B",
  "status": "confirmed",
  "date": "2026-09-15",
  "time": "14:30",
  "customer": { "firstName": "Maria", "email": "maria@example.com", "phone": "+12105551234", "smsConsent": true }
}
```

`status` is `confirmed`, `rescheduled`, or `cancelled`. Responses: `200 { ok: true }`, `401` bad signature, `400` invalid payload. The customer gets an email and, if `phone` and `smsConsent` are present, a text. Without `WEBHOOK_SIGNING_SECRET` the route accepts unsigned requests in development and rejects everything in production.

## Retry queue

`src/lib/integrations/retry-queue.ts`, processed by `GET /api/cron/retry` (every 10 minutes in `vercel.json`).

- A failed email/SMS/CRM delivery is appended to `<LEAD_DATA_DIR>/retry-queue.json` with `attempts: 1` and a first retry 60 seconds later.
- On each failed retry, `attempts` increases and the next attempt waits `60 s × 2^attempts` (4, 8, 16, 32 minutes, rounded up to the next cron run).
- At 6 attempts the job moves to `<LEAD_DATA_DIR>/dead-letter.ndjson` for manual review.
- If the queue file can't be written, the job is logged to the console instead.
- The queue holds full payloads (including customer details) in a plain file. Restrict access to the data directory.
- This is a file-based queue for a single server. On serverless hosts it is not durable; replace it with a durable queue (Upstash QStash, SQS, a database table) before relying on retries there.

## Scheduling

- `src/lib/scheduling/hours.ts` (isomorphic): 30-minute slots from opening time to 30 minutes before close, no Sundays, up to 60 days out, same-day slots at least 60 minutes from now, all in `business.timezone`. `SlotPicker` lists up to 21 upcoming open days (searching at most 31 calendar days ahead); the server re-validates with `validateSlot()`.
- `src/lib/scheduling/provider.ts`: `SchedulingProvider.request(req) → { status, providerReference }`. With `SCHEDULING_WEBHOOK_URL` set, the webhook provider is used; otherwise every request stays `requested`. To integrate Calendly, Google Calendar, or a DMS directly, implement `SchedulingProvider` and export it as `scheduling`.
- A customer is told "confirmed" only when the provider returns `confirmed: true` or staff call `/api/webhooks/scheduling`.

## Subscriptions and reminders

`src/lib/automation/subscriptions.ts`, sent by `GET /api/cron/reminders` (15:00 UTC Monday–Saturday in `vercel.json`).

Two kinds, both created by the `inventory-alert` form (`AlertSignup`):

- `search-alert` (offered on the inventory page when a filtered search returns no results): stores the current filter query. The first cron run only records existing matches; later runs email genuinely new matches (up to 8 listed, plus a link to all results).
- `vehicle-reminder` (vehicle page, "Get price-change updates for this vehicle"): one plain reminder, then emails only when the displayed price changes.

Guardrails:

- Explicit opt-in: the alert consent checkbox is required and never pre-checked.
- At most one email per subscription every 72 hours.
- Vehicle subscriptions: at most one plain reminder and 3 emails in total, then deactivated; deactivated automatically when the vehicle is sold or unpublished.
- Duplicate active subscriptions (same email, kind, query, vehicle) are not created.
- Every alert email includes an unsubscribe link signed with HMAC-SHA256 (`UNSUBSCRIBE_SECRET`). Opening the link changes nothing; the visitor presses a button that posts to `unsubscribeAction`, which re-verifies the token and deactivates every subscription for that address. Responses don't reveal whether the address was subscribed.
- In production, if `UNSUBSCRIBE_SECRET` is still the development default, tokens are refused and an error is logged.

Storage is `<LEAD_DATA_DIR>/subscriptions.json`. Like the retry queue, it needs a durable store on serverless hosts.

## Analytics

`src/lib/analytics.ts` exposes `track(event, props)`. It sends to `window.plausible` (only if you add a Plausible-compatible script; none is bundled) and/or `NEXT_PUBLIC_ANALYTICS_ENDPOINT` via `navigator.sendBeacon` with `{ event, props, path, ts }` (`path` excludes the query string). With neither configured, nothing is sent; in development events are logged with `console.debug`.

| Event | Fired by | Props |
| --- | --- | --- |
| `inventory_search` | Keyword typed (debounced, 2+ characters) | `result_count` |
| `filter_applied` | Any filter change or "clear all" | `filter`, `result_count` |
| `vehicle_view` | Vehicle page view | `stock_number`, `make`, `model`, `year`, `body_style` |
| `gallery_opened` | Full-screen gallery opened | `stock_number`, `photo_index` |
| `vehicle_360_started` | First 360 interaction or hosted-tour load | `stock_number`, `frame_count`, `source` |
| `financing_clicked` | Mobile "Apply" button, any link to the 700Credit application | `location`, `source` |
| `trade_in_started` | First focus in a trade-in form | form extras |
| `form_started` | First focus in any lead form | `form_type` (+ `stock_number` on vehicle forms) |
| `form_submitted` | Successful submission | `form_type`, `success` |
| `phone_clicked` | Any `tel:` link | `location` |
| `directions_clicked` | Google Maps directions links | `location` |
| `appointment_started` | First focus in test-drive/appointment forms | `form_type` |
| `assistant_opened` | Chat launcher | `location` |
| `assistant_question` | Each question sent (the text is never sent) | `location` |

**PII scrubbing** (`scrub()`): only whitelisted keys pass (`form_type`, `stock_number`, `make`, `model`, `year`, `body_style`, `filter`, `sort`, `result_count`, `location`, `view`, `photo_index`, `frame_count`, `success`, `source`); any string value that looks like an email, a US phone number, or a VIN is dropped; strings are cut to 80 characters. Names, free text, and amounts can't be sent even by mistake.

**Consent:** with `NEXT_PUBLIC_ANALYTICS_REQUIRE_CONSENT=true`, `ConsentBanner` asks once (Accept and Decline are equal), stores the choice in `localStorage` (`as_analytics_consent`), and nothing is sent until "granted".

## SEO and structured data

- `pageMetadata()` (`src/lib/seo.ts`) sets title, description, canonical URL (from `NEXT_PUBLIC_SITE_URL`), Open Graph, Twitter card, and `noindex` when requested. The root layout sets `metadataBase` and the title template `%s | Auto Select`.
- JSON-LD (rendered by `JsonLd`, which escapes `<`):
  - `AutoDealer` on every page (root layout): name, legal name, address, phone, email, hours from `business.hours`, area served, social profiles. No ratings and no geo coordinates.
  - `Car` + `Offer` on vehicle pages: VIN, stock number as `sku`, brand, model, year, trim, body, condition, mileage, colors, transmission, drivetrain, fuel, engine, doors, seats, up to 8 images, description; `Offer` with price, USD, availability (`InStock`, `LimitedAvailability`, `SoldOut`), seller reference. No `Offer` when there is no price.
  - `BreadcrumbList` wherever `Breadcrumbs` renders.
  - `FAQPage` on `/faq`, built from the same `faq.ts` text that is shown.
  - `Article` on each guide.
- `sitemap.ts`: static pages, published vehicles (with images), guides; revalidates every 900 s.
- `robots.ts`: production allows all except `/api/`, `/compare`, `/saved`, `/unsubscribe`; non-production disallows everything.
- Vehicle titles follow "Used {Year Make Model Trim} for Sale in Live Oak, TX"; sold vehicles get "Sold:" and `noindex`.

## Accessibility

- Skip link to `#main`; `main` is focusable so the skip link and back-to-top button move focus correctly.
- Focus: 3px accent outline on `:focus-visible`, switched to white inside dark sections (`.on-dark`).
- Landmarks and headings: one `h1` per page; sections are labelled by their headings; breadcrumbs use `nav aria-label="Breadcrumb"` and `aria-current="page"`.
- Forms: visible labels, required markers with screen-reader text, errors linked with `aria-describedby` and announced via `aria-live`, an error summary that receives focus, focus moved to the first invalid field, success messages that receive focus. SMS and marketing consent are unchecked by default.
- Inventory: result count announced in a live region; filter drawer uses a native `<dialog>`; active-filter chips are buttons labelled "Remove filter: …".
- Gallery: `aria-roledescription="carousel"`, arrow keys, labelled thumbnails, lightbox in a native `<dialog>`, swipe that doesn't block vertical scrolling.
- 360 viewer: focusable stage with `role="img"`, a live label that includes the current angle and zoom, keyboard controls (arrows, Shift for larger steps, +/−, 0, Space), labelled buttons with `aria-pressed`, instructions linked via `aria-describedby`, progress bar with `role="progressbar"`, and a fallback that returns to photos.
- Media tabs (`VehicleMedia`): `tablist`/`tab`/`tabpanel` with arrow-key navigation.
- Chat: labelled dialog, Escape closes and returns focus to the launcher, messages in a polite live region with "You said"/"Auto Select replied" prefixes.
- VIN is masked by default with a toggle; the full VIN is read character by character.
- Touch targets: 44px for primary controls (`md`/`lg` buttons, icon buttons `size-11`).
- Reduced motion respected everywhere (see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md#motion)).

## Performance

- Server components by default; interactive islands only where needed. Client lists get trimmed `VehicleSummary` objects.
- Vehicle pages and guides are pre-rendered at build (`generateStaticParams`); new feed vehicles render on first request. `/inventory` renders per request so filtered URLs arrive fully rendered, then filters instantly on the client.
- `next/image` with AVIF/WebP, device sizes 360–1920, qualities 60/75/85, 7-day minimum cache TTL, `priority` only on the hero and first gallery photo, explicit `sizes` everywhere.
- Fonts self-hosted by `next/font` with `display: swap`.
- 360 frames: nothing beyond the poster loads until the viewer is within 300px of the viewport; then ±2 frames; the full sequence streams only after the shopper interacts (6 concurrent requests, nearest frames first) and frames are decoded before display. See [360-MEDIA.md](360-MEDIA.md).
- Google Maps loads only on click. The hosted 360 tour iframe loads only on click.
- `/api/vehicles` responses are CDN-cacheable (`s-maxage=300, stale-while-revalidate=600`).
- Analytics uses `sendBeacon` and never blocks navigation.
- No third-party scripts are loaded by default.

## Security notes

- Security headers in `next.config.ts`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, restrictive `Permissions-Policy`. No Content-Security-Policy is set yet.
- Server Action body limit is raised to 50 MB for trade-in photos (6 × 8 MB); the pipeline enforces the per-file limits.
- Cron routes and `/api/inventory/sync` require `Authorization: Bearer <CRON_SECRET>` (timing-safe compare); they are closed in production until the secret is set.
- Unsubscribe tokens and webhook signatures use HMAC-SHA256 with timing-safe comparison.
- The assistant renders only a small, safe subset of Markdown and only links to site-relative URLs or autoselectgroups.com.
