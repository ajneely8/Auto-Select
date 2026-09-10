# Auto Select website

The website for **Auto Select**, a family-owned online used-car dealership at 12702 Toepperwein Rd #230, Live Oak, TX 78233. It replaces the WordPress site at autoselectgroups.com.

Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4. It runs with no database and no paid services out of the box: inventory comes from a JSON file, leads are written to a local file, and every outside integration (email, SMS, CRM, scheduling) is an optional signed webhook that stays in "log only" mode until you configure it.

> **Before launch:** work through [docs/CONTENT-CHECKLIST.md](docs/CONTENT-CHECKLIST.md). The 12 vehicles in `data/inventory.json` were copied from the old site on 2026-09-10 and have **not** been verified, several pages show visible `TODO` flags, and vehicle photos are still hot-linked from the old WordPress site.

## What's included

**Shopping**
- Inventory page (`/inventory`) with keyword search, 11 filter groups with live counts, price/year/mileage ranges, 7 sort orders, grid/list views, and filters stored in the URL so any search can be shared or bookmarked.
- Vehicle detail pages with photo gallery and lightbox, optional 360° exterior viewer (self-hosted frame sequences or a hosted tour), optional interior 360° tour, specs table, payment estimator, similar vehicles, and "recently viewed".
- Saved vehicles, saved searches, a compare tool (up to 3 vehicles), and recently viewed, all stored in the shopper's browser (no accounts).
- Email alerts for saved searches and price-change updates for a vehicle (opt-in, with unsubscribe).
- Inventory questions assistant: a chat widget that answers questions from the live listings. Uses Claude when `ANTHROPIC_API_KEY` is set, and a built-in rules engine when it isn't.

**Lead capture**
- 11 lead types (availability, test drive, appointment, financing inquiry, trade-in with photos, vehicle locator, delivery, service request, service-contract quote, general contact, inventory alert), all handled by one server action and one pipeline: sanitize, spam checks, rate limit, validation, duplicate check, storage, then email/SMS/CRM notifications with automatic retry.
- Appointment slots follow the dealership hours in `src/config/business.ts`. The site never tells a customer an appointment is confirmed unless a scheduling provider says so.

**Content and SEO**
- Financing, trade-in, vehicle locator, delivery, services, service contracts, about, reviews, FAQ, contact, 7 car-buying guides, privacy policy, and terms of use.
- Structured data: `AutoDealer`, `Car` + `Offer` per vehicle, `BreadcrumbList`, `FAQPage`, `Article`.
- Generated `sitemap.xml` (includes every published vehicle) and `robots.txt` (blocks indexing on preview deployments).
- Permanent redirects from old WordPress URLs.

**Operations**
- CSV/JSON inventory import with validation and quality warnings; sold vehicles are unpublished automatically.
- Optional live inventory feed (`INVENTORY_SOURCE=feed`) with a sync endpoint for cron jobs.
- Privacy-conscious analytics hook (no names, phones, emails, VINs, or amounts ever leave the browser) with an optional consent banner.

## Quick start

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:5240.

Everything in `.env.local` is optional for local development. Tip: delete any line you are not using instead of leaving it blank (for example `INVENTORY_FEED_URL=`), because blank URL and email values are validated at startup.

In development, emails and texts are not sent. They are printed to the terminal as `[email:log-only]` / `[sms:log-only]`, and leads are appended to `.data/leads.ndjson`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server on port 5240. |
| `npm run build` | Production build. |
| `npm start` | Serve the production build on port 5240. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Generate Next.js route types, then run `tsc --noEmit`. |
| `npm run check` | `typecheck` + `lint`. |
| `npm run inventory:import -- <file.csv \| file.json \| https://feed-url> [--keep-missing]` | Import inventory into `data/inventory.json`. Vehicles missing from the import are marked sold unless `--keep-missing` is passed. |
| `npm run inventory:check` | Print quality warnings for `data/inventory.json` (missing price, trim, MPG, features, low photo count, duplicate stock numbers, demo 360). |
| `npm run generate:demo-360` | Regenerate the rendered demonstration 360 sequence in `public/360/demo/`. Development use only. |

## Documentation

| Document | Audience | Contents |
| --- | --- | --- |
| [docs/HANDOFF.md](docs/HANDOFF.md) | Dealership | How to update inventory, photos, hours, financing link, reviews, FAQ, and where leads go. |
| [docs/CONTENT-CHECKLIST.md](docs/CONTENT-CHECKLIST.md) | Dealership + developer | Everything that must be verified or configured before launch. |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Developer | Vercel or VPS setup, environment variables, cron jobs, DNS cutover, post-launch checks. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Developer | Folder structure, data flow, lead pipeline, webhook contracts, SEO, accessibility, performance. |
| [docs/SITEMAP.md](docs/SITEMAP.md) | Both | Every route and API endpoint, redirects, and noindex pages. |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Designer / developer | Colors, type, spacing, motion, component rules, do's and don'ts. |
| [docs/360-MEDIA.md](docs/360-MEDIA.md) | Both | How the 360° viewer works, capture guidelines, and how to add frames to a vehicle. |
| [docs/INVENTORY-ASSISTANT.md](docs/INVENTORY-ASSISTANT.md) | Both | How the chat assistant works, enabling Claude, cost, privacy, and turning it off. |
| [docs/AUDIT.md](docs/AUDIT.md) | Both | Weaknesses of the old site and how this build addresses each. |

## Tech stack

- **Framework:** Next.js 16.3 (App Router, React Server Components, Server Actions), React 19.2, TypeScript 5
- **Styling:** Tailwind CSS 4 with design tokens in `src/app/globals.css`; fonts Inter and Barlow Semi Condensed via `next/font`
- **Validation:** Zod 4 (environment, inventory records, every form)
- **Icons:** lucide-react
- **Assistant:** `@anthropic-ai/sdk` (optional; only used when `ANTHROPIC_API_KEY` is set)
- **Hosting:** Vercel recommended (`vercel.json` defines the cron jobs); any Node 20.9+ server also works

## Where things live

| To change | Edit |
| --- | --- |
| Name, phone, email, address, hours, social links, financing link | `src/config/business.ts` |
| Navigation menus | `src/config/site.ts` |
| Inventory | `data/inventory.json` (or `npm run inventory:import`, or a live feed) |
| Reviews, team, FAQ, guides | `src/content/*.ts` |
| Colors, fonts, radii, shadows | `src/app/globals.css` |
| Old-URL redirects, image hosts, security headers | `next.config.ts` |
| Cron schedules | `vercel.json` |

## Before launch (short version)

1. Verify every vehicle, price, and photo; replace the auto-generated descriptions. See [CONTENT-CHECKLIST.md](docs/CONTENT-CHECKLIST.md#inventory).
2. Remove the demo 360 sequence from the 2016 Nissan Altima record. See [360-MEDIA.md](docs/360-MEDIA.md).
3. Move vehicle photos off `autoselectgroups.com/wp-content/uploads` **before** DNS points at the new site. See [DEPLOYMENT.md](docs/DEPLOYMENT.md#vehicle-photos-must-move-first).
4. Resolve every visible `TODO` flag and every `TODO(confirm)` in `src/config/business.ts`.
5. Get the privacy policy and terms of use reviewed by a lawyer.
6. Set `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `UNSUBSCRIBE_SECRET`, and `WEBHOOK_SIGNING_SECRET` in production, and connect at least `CRM_WEBHOOK_URL` or `EMAIL_WEBHOOK_URL` so leads reach a person.
