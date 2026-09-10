# Site map

Every route in `src/app`, what it does, and how it is indexed. "In sitemap" means the URL is listed in the generated `/sitemap.xml` (`src/app/sitemap.ts`).

## Page tree

```
/                                   Home: hero vehicle, quick search, featured vehicles, services, reviews, contact form
├── inventory                       All published vehicles with search, filters, sort, grid/list, saved searches, alert signup
│   └── [slug]                      Vehicle detail page, e.g. /inventory/2025-toyota-tundra-n246488
├── financing                       Financing overview, link to the secure 700Credit QuickQualify application, financing inquiry form (#apply)
├── trade-in                        Trade-in estimate form (vehicle details + up to 6 photos)
├── find-a-vehicle                  Vehicle locating service and request form
├── schedule                        Appointment request (test drive, dealership visit, phone consultation, service)
├── delivery                        Home/office delivery information and request form
├── services                        Automotive services (mobile mechanic, tires, body/paint, towing, jump starts) and request form
├── service-contracts               Service-contract information and quote request form
├── about                           Company story and team
├── reviews                         Customer reviews (two reviews from the old site; no ratings)
├── faq                             Grouped FAQ with FAQPage structured data
├── contact                         Address, hours, click-to-load map, contact form
├── blog                            Car-buying guides index
│   └── [slug]                      Guide article (7 guides, listed below)
├── saved                           Saved vehicles and saved searches (browser storage)
├── compare                         Side-by-side comparison of up to 3 vehicles
├── unsubscribe                     Confirm-to-unsubscribe page for alert emails
├── privacy-policy                  Privacy policy
└── terms-of-use                    Terms of use

/sitemap.xml                        Generated sitemap (revalidates every 900 s)
/robots.txt                         Generated robots rules
```

Special files: `src/app/not-found.tsx` (404 with links to inventory, locator, contact, and phone), `src/app/error.tsx` (error boundary with phone and inventory link), `src/app/inventory/loading.tsx` (skeleton while inventory loads).

## Pages in detail

| Route | Purpose | Query params / anchors | Indexed | In sitemap |
| --- | --- | --- | --- | --- |
| `/` | Home | none | Yes | Yes (priority 1.0) |
| `/inventory` | Inventory search | `q`, `condition`, `make`, `model`, `body`, `fuel`, `transmission`, `drivetrain`, `exterior`, `interior`, `feature`, `availability` (comma-separated lists), `year_min`, `year_max`, `price_min`, `price_max`, `miles_max`, `sort` (`price-asc`, `price-desc`, `year-desc`, `year-asc`, `miles-asc`, `miles-desc`; default newest) | Yes | Yes (0.9) |
| `/inventory/[slug]` | Vehicle detail | `#availability`, `#test-drive` (opens the matching lead-card tab), `#payment` | Yes, unless sold | Published vehicles only (0.8, up to 5 images each) |
| `/financing` | Financing | `#apply` | Yes | Yes |
| `/trade-in` | Trade-in estimate | none | Yes | Yes |
| `/find-a-vehicle` | Vehicle locator | none | Yes | Yes |
| `/schedule` | Appointments | `type` = `test-drive` \| `dealership-visit` \| `phone-consultation` \| `service`; `vehicle` = vehicle id or stock number (published vehicles only) | Yes | Yes |
| `/delivery` | Delivery request | `vehicle` = vehicle id or stock number (published vehicles only) | Yes | Yes |
| `/services` | Automotive services | `service` = `mobile-mechanic` \| `tires-balancing` \| `body-paint` \| `towing` \| `jump-start` \| `other` | Yes | Yes |
| `/service-contracts` | Service-contract quote | none | Yes | Yes |
| `/about` | About and team | none | Yes | Yes |
| `/reviews` | Reviews | none | Yes | Yes |
| `/faq` | FAQ | group anchors | Yes | Yes |
| `/contact` | Contact and directions | none | Yes | Yes |
| `/blog` | Guides index | none | Yes | Yes |
| `/blog/[slug]` | Guide | none | Yes | Yes |
| `/saved` | Saved vehicles/searches | none | **No** (`noindex`, disallowed in robots) | No |
| `/compare` | Compare | `ids` = up to 3 vehicle ids, comma-separated | **No** (`noindex`, disallowed in robots) | No |
| `/unsubscribe` | Unsubscribe | `email`, `token` (signed). Loading the page changes nothing; the visitor must press the button. | **No** (`noindex`, disallowed in robots) | No |
| `/privacy-policy` | Privacy | none | Yes | Yes (0.2) |
| `/terms-of-use` | Terms | none | Yes | Yes (0.2) |

### Guides (`/blog/[slug]`)

- `/blog/how-auto-financing-works`
- `/blog/what-to-bring-to-a-test-drive`
- `/blog/how-trade-in-estimates-work`
- `/blog/how-vehicle-delivery-works`
- `/blog/what-service-contracts-may-cover`
- `/blog/how-our-vehicle-locating-service-works`
- `/blog/buying-a-used-car-in-san-antonio`

## Navigation

Defined in `src/config/site.ts`.

- **Header:** Inventory, Financing, Trade-In, Find a Vehicle, Services, About, Contact, plus a saved-vehicles link (with count), a call button on smaller screens, and a "Book an Appointment" button (`/schedule`). The mobile menu adds Home, Delivery, and Service Contracts.
- **Footer, Shop:** Browse inventory, Find a vehicle, Saved vehicles, Compare vehicles, Book an appointment.
- **Footer, Buy:** Financing, Value your trade, Home & office delivery, Service contracts.
- **Footer, Company:** About Auto Select, Automotive services, Customer reviews, Car-buying guides, FAQ, Contact & directions.
- **Footer, Legal:** Privacy Policy, Terms of Use.
- **Mobile bottom bar** (all pages except vehicle detail): Call, Inventory, Apply (`/financing#apply`).

## API routes and server actions

| Endpoint | Method | Auth | What it does |
| --- | --- | --- | --- |
| `/api/assistant` | POST | Rate limited (20 requests per IP per 10 min) | Inventory assistant. Body `{ messages: [{ role, content }], path? }`. Streams newline-delimited JSON events. Returns 404 when `ASSISTANT_ENABLED=false`. |
| `/api/vehicles?ids=a,b,c` | GET | Public, CDN-cached 5 min | Vehicle summaries for saved/compare/recently viewed (max 24 ids; sold or unknown ids are dropped). |
| `/api/inventory/sync` | GET, POST | `Authorization: Bearer <CRON_SECRET>` | Refreshes the inventory cache and every page, returns counts and quality warnings. Cron: every 30 min. |
| `/api/cron/retry` | GET | `Authorization: Bearer <CRON_SECRET>` | Re-sends failed email/SMS/CRM webhooks with exponential backoff. Cron: every 10 min. |
| `/api/cron/reminders` | GET | `Authorization: Bearer <CRON_SECRET>` | Sends opt-in search alerts and saved-vehicle reminders. Cron: 15:00 UTC Monday–Saturday. |
| `/api/webhooks/scheduling` | POST | `X-AutoSelect-Signature` HMAC | Called by your scheduling tool/CRM when staff confirm, reschedule, or cancel; emails (and texts, with consent) the customer. |
| `submitLead` (`src/app/actions/leads.ts`) | Server action | Spam checks + rate limit | Every lead form posts here. |
| `unsubscribeAction` (`src/app/unsubscribe/actions.ts`) | Server action | Signed token | Turns off alerts and reminders for an email address. |

Without `CRON_SECRET`, the cron routes are open in development and return 401 in production. Without `WEBHOOK_SIGNING_SECRET`, the scheduling webhook is open in development and rejects everything in production.

## Redirects from old WordPress URLs

Defined in `next.config.ts`. All are permanent (HTTP 308).

| Old URL | New URL |
| --- | --- |
| `/locate-your-vehicle` | `/find-a-vehicle` |
| `/car-buying-service` (was a 404) | `/find-a-vehicle` |
| `/delivery-request` | `/delivery` |
| `/service-contract` | `/service-contracts` |
| `/inventory/page/:n` | `/inventory` |

Old URLs that already match a new route (for example `/inventory`, `/financing`, `/trade-in`, `/faq`, `/contact`) need no redirect if the old site used the same path. Before DNS cutover, export the old site's URL list (WordPress sitemap or a crawl) and add a redirect for any other page or old vehicle URL that has traffic or backlinks. See [DEPLOYMENT.md](DEPLOYMENT.md#old-url-redirects).

## Not indexed

- `/saved`, `/compare`, `/unsubscribe`: `noindex` meta plus `Disallow` in robots.
- `/api/*`: `Disallow` in robots.
- Sold vehicle pages: `noindex` (title prefixed "Sold:"), removed from the sitemap, shown with a "This vehicle has been sold" banner and similar vehicles.
- Unknown blog slugs: 404 with `noindex`.
- Every URL on non-production deployments (Vercel previews, or any build where `VERCEL_ENV` is not `production`): robots disallows everything.
