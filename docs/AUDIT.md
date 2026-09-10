# Audit: autoselectgroups.com (WordPress) and how the new site responds

Reviewed 2026-09-10. Each finding below lists what was wrong on the current WordPress site and what the new build does about it. Items marked **Open** still need action from Auto Select before launch; they are tracked in [CONTENT-CHECKLIST.md](CONTENT-CHECKLIST.md).

## Summary

The old site had the right services (inventory, financing, trade-ins, locating, delivery, service contracts, automotive services) but presented them in a way that cost trust and leads: unverifiable claims, an APR headline with no disclosure, broken and placeholder links, a homepage with no cars on it, and an inventory that could not be searched or filtered. The new site keeps every service, removes claims that cannot be backed up, puts real vehicles first, and routes every inquiry into one consistent lead pipeline.

## 1. Trust and compliance

| Old site | New site |
| --- | --- |
| "Financing from 1.49% APR" shown with no disclosure; "W.A.C." never defined. | No advertised rate anywhere. Financing copy states that approval, rates, and terms depend on the lender and applicant (`business.financing.disclosure`, shown on the homepage and `/financing`). The payment calculator uses an **example** APR (8.9%, `calculatorExampleApr`) and labels it as an illustration, not an offer of credit. |
| FAQ claimed "$2,000,000 in sales in 2015" and "access to any available vehicle in the entire country." | Removed. FAQ answers in `src/content/faq.ts` describe the process without figures or guarantees. |
| Service-contract page claimed "provider since 1991," "A rated," "same day coverage," "0% same as cash." | Removed. `/service-contracts` explains that coverage varies by plan and a quote is required. **Open:** a visible staff note asks Auto Select to confirm the provider name, plan details, transferability, and financing terms. |
| Team page listed Tally Luna twice with different titles. | Listed once (`src/content/team.ts`). **Open:** her current title is flagged on the page for confirmation. |
| Copyright said 2021. | Footer year is generated automatically and uses the legal name from `business.ts`. **Open:** confirm the registered legal name ("Auto Select Groups LLC" is taken from the old footer). |
| Contact form showed hours that conflicted with other pages. | Hours are defined once in `src/config/business.ts` and feed the footer, appointment slot picker, schedule validation, structured data, emails, and assistant. **Open:** four short hard-coded hour strings still exist (header menu, utility bar, vehicle lead card, one validation message); see the checklist. |
| Reviews had no source and no way to verify. | Only the two reviews that appeared on the old site are shown, with no star ratings and no rating schema. **Open:** add links to verified review profiles (Google Business Profile, etc.). |
| No privacy policy covering SMS, analytics, or chat. | Privacy policy and terms of use cover SMS consent, email unsubscribe, analytics, browser storage, and the assistant. **Open:** legal review; data-retention periods. |
| SMS and marketing consent not addressed. | SMS consent is a separate, unchecked checkbox; texts are never sent without it, and every text includes STOP/HELP language. Marketing emails are opt-in; alert emails include a signed unsubscribe link. |

## 2. Conversion

| Old site | New site |
| --- | --- |
| Homepage showed no vehicles. | Homepage hero features a real in-stock vehicle, followed by a quick search (condition, make, model, body, price) and up to six featured vehicles. |
| Vague calls to action ("Describe your car"). | Specific actions tied to the next step: "Check Availability," "Request Test Drive," "Get Pre-Qualified," "Value my trade," "Find My Vehicle," "Request delivery." |
| Several "more info" links pointed to `#`. | No placeholder links. Every internal link points to an existing route (verified against the route list in [SITEMAP.md](SITEMAP.md)). |
| Forms were generic and disconnected. | Eleven purpose-built forms share one pipeline with inline validation, clear success messages with a reference number, duplicate protection, and optional email/SMS/CRM delivery. The vehicle page has a sticky availability/test-drive card (desktop) and a sticky action bar (mobile). |
| No way to come back to a car. | Save vehicles, save searches, compare up to three, recently viewed, and opt-in email alerts for new matches or price changes. |
| Appointment requests could read as confirmed. | Requests are labeled "not yet confirmed" until a scheduling provider or staff confirmation says otherwise. |
| No after-hours help. | The inventory assistant answers questions from the current listings at any hour and hands off to phone, forms, or `/find-a-vehicle`. |

## 3. Content

| Old site | New site |
| --- | --- |
| Duplicate and repetitive sections. | Each page has one job, and each homepage section covers one service once. |
| Grammar errors ("base on your needs," "Name Your (required)"). | Copy rewritten in plain English. Form labels are complete ("First name," "Email") with a single "Required" legend. |
| Placeholder images. | Only real vehicle photos. Team members without photos get an initials monogram instead of stock images. |
| Listings lacked trim, features, drivetrain, descriptions, and MPG. | The data model supports all of them. Body style, drivetrain, doors, and seats were filled from the NHTSA VIN decoder where available. Missing values show "Ask us" instead of being guessed. **Open:** every vehicle still needs a written description, MPG, features, and (for most) a confirmed trim. `npm run inventory:check` lists what is missing. |
| No buying guidance. | Seven car-buying guides (financing, test drives, trade-ins, delivery, service contracts, vehicle locating, buying in San Antonio) in `src/content/blog.ts`. |

## 4. UX and mobile

| Old site | New site |
| --- | --- |
| Inventory split across two pages with no filters, search, or sort. | One inventory page with keyword search, filters with live counts, range filters, seven sort orders, grid/list views, removable filter chips, and a filter drawer on mobile. Filters are stored in the URL, so back/forward and shared links work. |
| Small tap targets, desktop-first layout. | Mobile-first layout with 44px minimum targets on primary controls, a bottom action bar (Call / Inventory / Apply), a sticky vehicle action bar, and swipe-friendly gallery and 360 viewer. |
| No accessibility provisions. | Skip link, visible focus outlines, labeled forms with announced errors, screen-reader result counts, keyboard-operable gallery/360/tabs, and reduced-motion support. See [ARCHITECTURE.md](ARCHITECTURE.md#accessibility). |
| Map loaded from Google on every visit. | The map loads only when the visitor clicks to show it; address and directions links are always visible. |

## 5. SEO

| Old site | New site |
| --- | --- |
| No vehicle structured data. | `Car` + `Offer` JSON-LD on every vehicle page (VIN, mileage, price, availability, photos), plus `AutoDealer`, `BreadcrumbList`, `FAQPage`, and `Article`. |
| Generic titles; paginated inventory. | Unique titles and descriptions per page (e.g. "Used 2025 Toyota Tundra CrewMax for Sale in Live Oak, TX"), canonical URLs, Open Graph tags. |
| `/car-buying-service` returned 404; old URLs would break. | Permanent redirects in `next.config.ts` for `/locate-your-vehicle`, `/car-buying-service`, `/delivery-request`, `/service-contract`, and `/inventory/page/:n`. |
| No reliable sitemap for vehicles. | `sitemap.xml` lists every published vehicle (with up to 5 image URLs each), every guide, and the main pages; sold vehicles drop out automatically and their pages are set to `noindex`. |
| Preview/staging could be indexed. | `robots.txt` blocks all crawling on non-production deployments and blocks `/api/`, `/compare`, `/saved`, `/unsubscribe` in production. |

## 6. Technical

| Old site | New site |
| --- | --- |
| WordPress with plugins; mod_security blocked some visitors. | Next.js app with no plugin surface and no request-blocking firewall rules of its own. Security headers (`nosniff`, `SAMEORIGIN` framing, strict referrer policy, restrictive permissions policy) are set in `next.config.ts`. |
| Unoptimized images. | `next/image` serves AVIF/WebP at device-appropriate sizes with a 7-day cache. |
| Manual inventory entry. | CSV/JSON import with validation, a live-feed option with scheduled sync, automatic unpublishing of sold vehicles, and quality warnings. |
| Leads went only to email (if at all). | One lead pipeline with spam protection (honeypot, fill-time check, link-spam check, per-IP rate limit), duplicate prevention, storage, signed webhooks, and a retry queue for failed deliveries. |

## What the new site does not do (by design or not yet)

- It does not scrape the old site or any third party for inventory. Use a DMS export or an authorized feed.
- It does not include a bundled email or SMS provider. Email, SMS, CRM, and scheduling are webhooks you point at Zapier, Make, n8n, a CRM, or a small function that calls a provider.
- It does not host photos. They are currently hot-linked from the old WordPress uploads folder and must be moved before DNS cutover (see [DEPLOYMENT.md](DEPLOYMENT.md#vehicle-photos-must-move-first)).
- It has no staff login or admin dashboard. Content is edited in files (see [HANDOFF.md](HANDOFF.md)).
