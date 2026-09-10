# Content checklist — before launch

Everything on this list needs a decision or confirmation from Auto Select before the site goes live. Nothing here is a guess the website can make on its own.

Work top to bottom; the items in **Blockers** must be done before the site replaces autoselectgroups.com.

## Blockers

- [ ] Every vehicle, price, and photo verified (see [Inventory](#inventory)).
- [ ] The demonstration 360 sequence removed from stock **N287963** (2016 Nissan Altima).
- [ ] Vehicle photos moved off `autoselectgroups.com/wp-content/uploads` — they break the moment DNS points at the new site. See [DEPLOYMENT.md](DEPLOYMENT.md#vehicle-photos-must-move-first).
- [ ] Every visible `TODO` flag resolved and removed from the pages (they are visible to the public in production).
- [ ] Privacy policy and terms of use reviewed by a lawyer.
- [ ] `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `UNSUBSCRIBE_SECRET`, and `WEBHOOK_SIGNING_SECRET` set in production.
- [ ] At least one lead destination connected (`CRM_WEBHOOK_URL` and/or `EMAIL_WEBHOOK_URL`), tested end to end.

## Business information

All of this lives in `src/config/business.ts`. Items marked `TODO(confirm)` in that file are flagged in the code.

**Marked `TODO(confirm)`**

- [ ] **Legal name** — currently `"Auto Select Groups LLC"`, taken from the old site's footer. Confirm the exact registered entity name. It appears in the footer copyright, the privacy policy, the terms of use, and the `AutoDealer` structured data.
- [ ] **Map coordinates** — `geo: { lat: 29.5646, lng: -98.3337 }` is an approximate center for the address. Confirm the pin lands on the right suite. (Nothing currently displays these coordinates; the map searches by street address. Fix the address or remove the field, whichever is right.)
- [ ] **Example APR for the payment calculator** — `calculatorExampleApr: 8.9`. Confirm this illustrative rate is acceptable, choose a different one, or decide to remove the calculator's default rate. It is labelled an example and never presented as an offer.
- [ ] **Languages** — `languages: ["English", "Spanish"]`, based on team bios on the old site. Confirm before the site advertises Spanish-language help.

**Also verify (not flagged, but taken from the old site)**

- [ ] Address: 12702 Toepperwein Rd #230, Live Oak, TX 78233.
- [ ] Phone: (210) 455-3050 — this is the number on every page, in emails, and in the assistant.
- [ ] Email: info@autoselectgroups.com — receives lead notifications unless `LEAD_NOTIFY_EMAIL` is set.
- [ ] Hours: Monday–Saturday 10:00 AM–6:00 PM, closed Sunday. These drive appointment slots (last slot 5:30 PM), the "closed Sunday" rule, structured data, and email copy.
- [ ] Tagline "We Make Car Buying Simple" and the one-paragraph business description.
- [ ] Service area wording: "Live Oak and the San Antonio area".
- [ ] Facebook: `facebook.com/AutoSelectgroups` and Instagram: `instagram.com/autoselect_usa` — both are published in the structured data and footer.
- [ ] Financing provider name ("700Credit QuickQualify") and the financing disclosure paragraph.

**Developer follow-up:** hours are also hard-coded as short text in four places and won't update when `business.ts` changes: `src/components/layout/UtilityBar.tsx` (line ~17), `src/components/layout/Header.tsx` (line ~135), `src/components/vehicle/LeadCard.tsx` (line ~88), and the "10:00 AM–5:30 PM" message in `src/lib/scheduling/hours.ts` (line ~74). If hours change, update these too — or wire them to the config.

## Inventory

Source: `data/inventory.json`, captured from the old site's inventory pages on **2026-09-10**, with body style, drivetrain, doors, and seats from the NHTSA VIN decoder. `meta.verified` is `false`.

Run `npm run inventory:check` at any time to see the current list of gaps.

**Applies to all 12 vehicles**

- [ ] Confirm each vehicle is still in stock and each price is current (prices were copied on the capture date).
- [ ] Replace every auto-generated description ("This 2016 Nissan Altima has 112,517 miles…") with a written one. Aim for 2–4 sentences about condition, equipment, and history — at least 120 characters, or the quality check flags it.
- [ ] Add EPA MPG (city/highway) — none of the 12 have it.
- [ ] Add a features/equipment list — 9 of the 12 have none, and the rest have one or two.
- [ ] Confirm the trim for the 8 vehicles that have none, and the trims that came from a VIN decode.
- [ ] Add photos where the count is low (fewer than 8 flags a warning; the Sonata has 2 and the Touareg has 8).
- [ ] Decide which vehicles should be featured on the homepage (6 are currently flagged).
- [ ] Add vehicle history report links (`historyReportUrl`) if you publish them — none of the 12 have one.
- [ ] Set `meta.verified` to `true` (or re-import the file) once everything above is done.

### Per-vehicle notes

These are the staff notes stored on each record (`internalNotes` — never shown to shoppers), reproduced exactly.

#### NY29861 — 2012 BMW 5 Series

VIN WBAXG5C58CDY29861 · $10,988 · 124,716 mi · 40 photos · featured on the homepage · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Drivetrain not published and not returned by VIN decode — confirm RWD vs xDrive.
- [ ] Listing shows 2.0L 4-cylinder (528i). Confirm trim.

#### N192154 — 2016 Dodge Charger SE

VIN 2C3CDXBGXGH192154 · $14,788 · 91,299 mi · 9 photos · not featured · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Trim 'SE' and RWD from VIN decode.
- [ ] Listing says 5-speed automatic and flex fuel; VIN decode says gasoline. Many 2016 Charger V6 models use an 8-speed — confirm transmission and fuel type.

#### N129769 — 2019 Ford Fiesta SE

VIN 3FADP4BJ5KM129769 · $12,488 · 21,455 mi · 17 photos · featured on the homepage · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Trim 'SE' from VIN decode. Fiesta is front-wheel drive in every configuration.
- [ ] VIN decode lists flexible fuel; listing says gasoline — confirm.

#### N082645 — 2015 Honda Accord LX

VIN 1HGCR2F38FA082645 · $12,788 · 139,095 mi · 16 photos · not featured · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Trim 'LX' from VIN decode. Accord is front-wheel drive.

#### N659247 — 2018 Hyundai Sonata

VIN 5NPE34AF1JH659247 · $13,788 · 100,736 mi · 2 photos · not featured · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Only 2 photos — add a full photo set.
- [ ] VIN decode returns several possible trims (SEL/Limited/Sport). Confirm trim.

#### N133749 — 2016 Hyundai Santa Fe

VIN KM8SRDHF1GU133749 · $13,988 · 69,988 mi · 35 photos · featured on the homepage · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] VIN decode reports 4WD/AWD. Confirm trim (decode returned an unrecognized value).

#### N287963 — 2016 Nissan Altima

VIN 1N4AL3AP2GC287963 · $11,988 · 112,517 mi · 31 photos · featured on the homepage · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Confirm trim.
- [ ] Currently displays the DEMONSTRATION 360 sequence in development only. Replace with a real capture or remove exterior360Frames.

#### N656304T — 2016 Nissan Sentra

VIN 3N1AB7AP6GL656304 · $6,988 · 173,100 mi · 16 photos · not featured · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Stock number ends in 'T' — confirm this is correct.
- [ ] Confirm trim.

#### N187199 — 2012 Toyota Sienna

VIN 5TDKK3DC2CS187199 · $10,988 · 181,079 mi · 24 photos · not featured · 1 feature listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Sienna 4x2 decodes as front-wheel drive. Confirm trim and whether doors are power-operated before publishing the feature.
- [ ] Add power sliding doors to features only after confirming.

#### N246488 — 2025 Toyota Tundra CrewMax

VIN 5TFNA5DB4SX246488 · $61,988 · 8,225 mi · 15 photos · featured on the homepage · 2 features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] VIN decode suggests the Platinum grade — confirm before adding it to the trim.
- [ ] 3.4L V6 from listing (i-FORCE twin-turbo). Confirm and consider listing the hybrid status if applicable.

#### N002218 — 2014 Volkswagen Touareg

VIN WVGDF9BPXED002218 · $11,988 · 122,384 mi · 8 photos · not featured · no features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] Touareg uses all-wheel drive (4MOTION). Confirm trim (decode: V6 FSI).

#### T543348 — 2010 Volvo XC90

VIN YV4982CZ4A1543348 · $5,988 · 221,048 mi · 30 photos · featured on the homepage · 2 features listed

- [ ] Still available at this price?
- [ ] Description auto-generated from listing specs — replace with a written description.
- [ ] MPG not published — add EPA ratings.
- [ ] VIN decode reports AWD and 7 seats.

## Visible TODO flags on pages

Each of these renders an amber "TODO · …" label that the public can see. Resolve the question, update the copy, then delete the flag (and the "Staff note" box around it where there is one).

| Page | File | Flag text |
| --- | --- | --- |
| `/about` — story section | `src/app/about/page.tsx:67` | Add founding year and story details |
| `/about` — team section | `src/app/about/page.tsx` | Confirm this roster, titles, and photos are still current |
| `/about` — Tally Luna's card | `src/app/about/page.tsx:181` (text from `src/content/team.ts`) | The previous site lists Tally as both "General Sales Manager" and "Office Manager / Title Clerk." Confirm the current title. |
| `/about` — Spanish note | `src/app/about/page.tsx:192` | Confirm Spanish-language assistance before advertising it |
| `/financing` — staff note | `src/app/financing/page.tsx:137` | Confirm whether pre-qualification uses a soft credit inquiry (no score impact) before saying so on this page |
| `/find-a-vehicle` — staff note | `src/app/find-a-vehicle/page.tsx:115` | Confirm whether the locating service involves any fee or deposit, and where located vehicles are sourced, before publishing |
| `/services` — staff note | `src/app/services/page.tsx:160` | Confirm the mechanic certification type, service area, and towing availability |
| `/service-contracts` — staff note | `src/app/service-contracts/page.tsx:149` | Confirm provider name, plan details, and any transferability or financing terms before publishing |
| `/reviews` | `src/app/reviews/page.tsx:60` | Add links to verified review profiles (Google Business Profile, etc.) once confirmed. |
| `/privacy-policy` — retention section | `src/app/privacy-policy/page.tsx:283` | Confirm specific data-retention periods for leads, trade-in photos, and assistant logs. |
| `/privacy-policy` and `/terms-of-use` — header | `src/app/_legal/LegalDocument.tsx:55` | Legal review required before publishing. |
| `/faq` — "Can you bring a vehicle to me?" | `src/content/faq.ts:104` | Confirm that Auto Select brings vehicles to customers for test drives, and any area limits or fees. |

## Legal review

- [ ] Privacy policy (`src/app/privacy-policy/page.tsx`) reviewed by counsel — especially the SMS section, Texas privacy rights, the assistant section, and data retention.
- [ ] Terms of use (`src/app/terms-of-use/page.tsx`) reviewed — pricing/availability disclaimers, financing, estimates and calculators, limitation of liability, governing law.
- [ ] Both "Last updated" dates (currently September 10, 2026) set to the real publication date.
- [ ] Confirm the SMS consent language and STOP/HELP handling match whatever SMS provider you connect.
- [ ] Confirm the dealer-fee and "price excludes tax, title, license, registration, and dealer fees" wording matches your paperwork and Texas requirements.
- [ ] Decide the retention periods named in the privacy policy and write them in.
- [ ] Confirm the vehicle-service-contract copy against the actual contract you sell.

## Financing link

- [ ] Open the application URL in `business.financing.applicationUrl` and confirm it is the correct, current 700Credit QuickQualify link for Auto Select: `https://www.700dealer.com/QuickQualify/807b82f244f643f3b7a7a6255772a0db-2020624`
- [ ] Confirm the application loads over HTTPS, is mobile-friendly, and shows Auto Select's branding.
- [ ] Submit a test application (or ask 700Credit how to) and confirm where the results arrive.
- [ ] Confirm whether pre-qualification is a soft inquiry — the site does **not** claim it yet (see the `/financing` TODO).
- [ ] Confirm the financing disclosure wording in `business.financing.disclosure`.

## Team

`src/content/team.ts` now has the full 9-person roster with real photos, pulled directly from the live About page on autoselectgroups.com: Patrick Simon (Owner), Veronica Simon (Business Manager / Finance), Tally Luna (Office Manager / Title Clerk), Brandon Simon (Internet Manager, in training), Francisco Raphael (Certified Trade Appraisal), Tina Latt (Office Manager), Carlos Luengo (IT Specialist / Website Developer), Josie Reyes (Bookkeeper), and Robert Garcia (Certified Mobile Mechanic). Photos are hot-linked from the same `autoselectgroups.com/wp-content/uploads` host as inventory photos — see the [vehicle-photos-must-move-first](DEPLOYMENT.md#vehicle-photos-must-move-first) note, which applies here too. A card falls back to an initials monogram automatically if a photo URL ever breaks. The "Meet the Team" section is the first section after the hero on `/about`.

- [ ] Confirm the roster is still current — people and titles can change.
- [ ] Confirm each title and bio, including the years of experience quoted.
- [ ] Resolve Tally Luna's title (the old site listed her twice with two titles).
- [ ] Confirm who is fluent in Spanish before the site says so.
- [ ] Add the founding year and company story for the About page.
- [ ] Move the team photos to your own CDN/hosting before the old WordPress site comes down (same deadline as vehicle photos).

## Reviews

- [ ] Confirm the two reviews in `src/content/reviews.ts` (Tremayne Williams, Karen Herzing) may be republished. They came from the old site, with light grammar corrections and unchanged meaning.
- [ ] Provide links to verified review profiles (Google Business Profile, Facebook, DealerRater) so reviews can be attributed and shoppers can read more.
- [ ] Decide whether to collect new reviews and where to send customers.
- [ ] Note: no star ratings are shown and no rating structured data is generated, because there is no verifiable rating source. Don't add either until there is one.

## Integrations to connect

- [ ] **Lead delivery:** point `CRM_WEBHOOK_URL` at your CRM's inbound webhook, or at a Zapier/Make/n8n hook. Payload: `{ event: "lead.created", lead }`.
- [ ] **Email:** point `EMAIL_WEBHOOK_URL` at a service that actually sends mail (Zapier → Gmail/Outlook, or a small function that calls Resend/Postmark). No email provider is bundled; without this, emails are only logged.
- [ ] Set `LEAD_NOTIFY_EMAIL` if lead notices should go somewhere other than info@autoselectgroups.com, and set `EMAIL_FROM` to an address whose domain is authorized (SPF/DKIM) with your sender.
- [ ] **SMS (optional):** `SMS_WEBHOOK_URL` → Twilio or similar. Texts only go out with explicit consent and always include STOP/HELP language.
- [ ] **Scheduling (optional):** `SCHEDULING_WEBHOOK_URL` for automatic confirmations, and have staff/CRM call `POST /api/webhooks/scheduling` when they confirm, reschedule, or cancel.
- [ ] **Inventory feed (optional):** if your DMS can publish a JSON feed, set `INVENTORY_SOURCE=feed` and `INVENTORY_FEED_URL` so stock updates itself.
- [ ] Test each webhook with a real submission and confirm the signature check on the receiving side (`X-AutoSelect-Signature`).
- [ ] **Developer:** if hosting on Vercel, decide what to do about the file-based retry queue and inventory-alert subscriptions, which are not durable there. See [DEPLOYMENT.md](DEPLOYMENT.md#serverless-storage-note-important).
- [ ] **Developer:** leave `TURNSTILE_SECRET_KEY` unset until a Turnstile widget is added to the forms — setting it now would reject every submission.

## Environment variables required in production

- [ ] `NEXT_PUBLIC_SITE_URL` — `https://autoselectgroups.com` (canonical URLs, sitemap, email links). Requires a rebuild when changed.
- [ ] `CRON_SECRET` — protects `/api/cron/*` and `/api/inventory/sync`.
- [ ] `UNSUBSCRIBE_SECRET` — signs unsubscribe links; links are refused if it is left at the development default.
- [ ] `WEBHOOK_SIGNING_SECRET` — signs outbound webhooks and verifies the inbound scheduling webhook.
- [ ] `NEXT_PUBLIC_SHOW_DEMO_360` — leave `false`/unset in production.
- [ ] `LEAD_STORE=none` if hosting on Vercel (see deployment notes).

Generate each secret with `openssl rand -hex 32` and store them in the hosting provider's environment settings, not in the repository.

## Analytics and consent decision

- [ ] Decide whether to run analytics at all. Nothing is sent unless you set `NEXT_PUBLIC_ANALYTICS_ENDPOINT` or load a Plausible-compatible script — no analytics script is bundled.
- [ ] If you use analytics, decide whether to require consent: `NEXT_PUBLIC_ANALYTICS_REQUIRE_CONSENT=true` shows a banner and sends nothing until the visitor accepts; `false` sends events without a banner. The privacy policy already says consent is asked for "where required" — make the setting and the policy agree.
- [ ] Confirm the privacy policy's analytics section matches the tool you choose (the current text describes cookie-free, privacy-friendly analytics that never receive names, phones, emails, VINs, or form text — which is what the built-in tracker does).
- [ ] If you add Google Analytics or any advertising pixel, the privacy policy, the cookie/storage section, and the consent behavior all need to be rewritten to match. Nothing of that kind is installed today.

## Nice-to-have (not a blocker)

- [ ] **Homepage hero background video.** Checked the entire old site (home, about, inventory, financing, services, FAQ, contact, trade-in, delivery, service contracts, blog) for usable footage. The only video anywhere on autoselectgroups.com is `AutoSelect-Version-4.mp4` on the Service Contracts page — an AI-avatar (Synthesia) spokesperson explaining extended warranties, with spoken narration, burned-in captions, and a visible "Synthesia" watermark. It is not usable as a silent looping background: wrong topic for the homepage, and a talking head with captions looks broken muted. Revisit once there is real dealership b-roll (the lot, vehicles, the team) shot **without narration** — a 15–30 second silent loop is what a hero background needs. When that footage exists: mute + loop + no controls, a play/pause toggle (required for accessibility — content that auto-plays and moves for more than 5 seconds must be pausable), and it must not autoplay for visitors with reduced-motion enabled (show a static poster frame instead, matching how the vehicle photo showcase already behaves).

## Final pre-launch pass

- [ ] `npm run check` passes (types + lint).
- [ ] `npm run inventory:check` reports no issues you haven't accepted.
- [ ] No "TODO ·" text appears anywhere on the built site (search the live pages).
- [ ] Every form submitted once on staging and received by a person.
- [ ] Phone number, address, and hours read correctly on the homepage, footer, contact page, and Google Business Profile.
- [ ] Post-launch checks in [DEPLOYMENT.md](DEPLOYMENT.md#post-launch-checks) completed.
