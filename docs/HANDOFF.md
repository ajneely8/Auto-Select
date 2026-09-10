# Dealership handoff guide

This is the day-to-day guide for keeping the Auto Select website current. It's written for the person running the dealership, not for a programmer. Where a step needs a developer, it says so.

**Two things to know first**

1. The website has no admin login. Inventory and page text live in files in the project. You (or your developer) edit a file, then the site is rebuilt and published. Nothing changes on the live site until that publish step happens.
2. The website never invents information. If a vehicle has no MPG or no features listed, the page says "Ask us" instead of guessing. So the more you fill in, the better the listings work.

---

## Updating inventory

Inventory lives in one file: `data/inventory.json`. There are two ways to update it.

### Option 1 — Import a spreadsheet (easiest for many vehicles)

1. Open `data/inventory-template.csv` in Excel or Google Sheets. It has one example row showing every column.
2. Replace the example with your vehicles, one row each. Keep the header row exactly as it is.
3. Save as CSV, then have someone run:

   ```bash
   npm run inventory:import -- path/to/your-file.csv
   ```

4. The importer checks every row, tells you about anything it skipped, and prints a list of quality warnings (missing price, fewer than 8 photos, short description, missing trim, duplicate stock numbers).

**Things to know about importing**

- Any vehicle that is in the website today but **not** in your spreadsheet is automatically marked **sold** and disappears from the site. That's usually what you want. To keep them, add `--keep-missing` to the command.
- For columns that hold lists — features, photos, 360 frames — separate the values with the `|` character:
  `Backup camera|Bluetooth|Heated seats`
- `featured` accepts `yes` or `no`. `status` accepts `available`, `pending`, `sold`, or `in-transit`.
- The importer does not carry over staff notes from the old file, so re-importing clears the internal notes that are on the current records.

### Option 2 — Edit the JSON file (good for one or two changes)

Each vehicle in `data/inventory.json` looks like this:

```json
{
  "id": "n246488",
  "slug": "2025-toyota-tundra-n246488",
  "status": "available",
  "condition": "used",
  "year": 2025,
  "make": "Toyota",
  "model": "Tundra",
  "trim": "CrewMax",
  "bodyStyle": "Pickup Truck",
  "price": 61988,
  "salePrice": null,
  "mileage": 8225,
  "vin": "5TFNA5DB4SX246488",
  "stockNumber": "N246488",
  "exteriorColor": "White",
  "interiorColor": "Black",
  "transmission": "Automatic",
  "drivetrain": "4WD",
  "fuelType": "Gasoline",
  "engine": "3.4L 6-Cylinder",
  "mpgCity": null,
  "mpgHighway": null,
  "doors": null,
  "seats": 5,
  "description": "Write two to four honest sentences here.",
  "features": ["CrewMax cab", "Four-wheel drive"],
  "photos": [{ "url": "https://…/photo-1.jpg", "alt": "2025 Toyota Tundra CrewMax, primary photo" }],
  "exterior360Frames": null,
  "exterior360EmbedUrl": null,
  "interior360Url": null,
  "historyReportUrl": null,
  "featured": true,
  "dateAdded": "2026-09-01"
}
```

What each field controls:

| Field | What it does |
| --- | --- |
| `status` | `available` shows normally. `pending` shows a "Sale Pending" badge. `in-transit` shows "In Transit". `sold` removes it from the website. |
| `price` | The advertised price. Use `null` for "Call for Price". |
| `salePrice` | Optional. If it's lower than `price`, the site shows the sale price with the old price crossed out. |
| `featured` | `true` puts the vehicle on the homepage. |
| `description` | Shown under "Vehicle overview." Two to four sentences is right. |
| `features` | Bulleted equipment list. Only list what the vehicle actually has. |
| `mpgCity` / `mpgHighway` | EPA numbers. Leave `null` if you don't have them and the page will say they aren't posted. |
| `historyReportUrl` | A link to a vehicle history report, if you publish one. |
| `dateAdded` | Used for "Newest arrivals" sorting. |
| `internalNotes` | Staff-only. Never shown on the website. |

Rules that are easy to trip over: `price` and `mileage` are plain numbers with no `$` or commas; text goes in double quotes; `null` (no quotes) means "we don't have this"; every item in a list is separated by a comma except the last one.

### Marking a vehicle sold

Change one word:

```json
"status": "sold"
```

The vehicle disappears from the inventory page, homepage, search, sitemap, and the chat assistant. Its own page stays online for anyone with the old link and shows "This vehicle has been sold" plus similar vehicles, and it is removed from Google over time.

### Checking your work

```bash
npm run inventory:check
```

This prints every vehicle with something missing — no price, low photo count, short description, no trim, no features, no MPG, duplicate stock numbers, or a demo 360 sequence still attached.

### 3. Publish your changes

Editing the file is not enough — the site has to be rebuilt:

- **On Vercel:** commit and push the change (or edit the file through GitHub's website and save). A new deployment starts automatically and is live in a couple of minutes.
- **On your own server:** your developer runs `git pull`, `npm run build`, and restarts the site.
- **If a live inventory feed is connected** (`INVENTORY_SOURCE=feed`), you don't do any of this. Update stock in your inventory system; the website refreshes itself every 30 minutes.

---

## Photos

**Where photos live today:** they are still loaded from the old WordPress site (`autoselectgroups.com/wp-content/uploads/…`). **This has to change before the domain is pointed at the new site**, or every photo will break. Your developer should handle it — see [DEPLOYMENT.md](DEPLOYMENT.md#vehicle-photos-must-move-first).

Once photos are hosted somewhere permanent, adding photos to a vehicle just means listing their web addresses in the `photos` list, in the order you want them shown.

**Recommendations**

- **How many:** at least 8; 20–30 is better. Anything under 8 gets flagged as a quality warning.
- **Order matters.** The first photo is the one used on the inventory card, in Google/Facebook previews, and as the 360 poster. Make it a clean front three-quarter shot.
- A good order: front three-quarter, front, driver's side, rear three-quarter, rear, passenger side, wheels, engine bay, dashboard, front seats, rear seats, cargo area, odometer, infotainment screen, any damage you're disclosing.
- **Size:** landscape, at least 1600 pixels wide, roughly 4:3. Photos are automatically resized and converted to modern formats, so upload the good version and let the site handle the rest.
- **Take them in even light**, clean the vehicle first, and shoot every vehicle the same way — consistency makes the whole page look more professional.
- **Alt text** (the description screen readers and search engines use) is written automatically: "2025 Toyota Tundra CrewMax, photo 3 of 15." If you want a custom one, add `"alt": "your text"` next to the photo's URL.
- Never use a photo of a different vehicle, a manufacturer's press photo, or a computer-generated image.

---

## 360° spins

If you have a proper 360 image sequence of a vehicle (36, 48, or 72 photos taken all the way around), the site can show a drag-to-rotate viewer on that vehicle's page. There's a full guide with capture instructions in [360-MEDIA.md](360-MEDIA.md).

Two rules:

1. A 360 view must be of **that exact vehicle**. Never build one from a single photo or another car.
2. There's a demonstration spin (a computer-drawn car, watermarked "DEMO") currently attached to the **2016 Nissan Altima, stock N287963**. It only shows during development, but it must be removed before launch.

---

## Hours, phone, address, and email

All of it is in one file: `src/config/business.ts`. Change it there and it updates the whole site — pages, footer, emails, appointment times, Google's structured data, and the chat assistant.

```ts
name: "Auto Select",
legalName: "Auto Select Groups LLC",        // used in the footer copyright and legal pages
tagline: "We Make Car Buying Simple",
address: {
  street: "12702 Toepperwein Rd #230",
  city: "Live Oak",
  region: "TX",
  postalCode: "78233",
  country: "US",
},
phone: { display: "(210) 455-3050", e164: "+12104553050" },   // change BOTH
email: "info@autoselectgroups.com",
timezone: "America/Chicago",
hours: [
  { day: 0, open: null,    close: null    },   // Sunday — null/null means closed
  { day: 1, open: "10:00", close: "18:00" },   // Monday
  { day: 2, open: "10:00", close: "18:00" },
  { day: 3, open: "10:00", close: "18:00" },
  { day: 4, open: "10:00", close: "18:00" },
  { day: 5, open: "10:00", close: "18:00" },
  { day: 6, open: "10:00", close: "18:00" },   // Saturday
],
hoursSummary: [
  { label: "Monday–Saturday", value: "10:00 AM–6:00 PM" },   // the text people read
  { label: "Sunday", value: "Closed" },
],
social: {
  facebook: "https://www.facebook.com/AutoSelectgroups",
  instagram: "https://www.instagram.com/autoselect_usa/",
},
```

Notes:

- `hours` uses 24-hour time: `"18:00"` is 6:00 PM. Day 0 is Sunday, day 6 is Saturday.
- Change `hours` **and** `hoursSummary` together — the first controls which appointment times customers can pick (30-minute slots, last one 30 minutes before closing), the second is the text shown on the site.
- The phone number appears twice on purpose: `display` is what people read, `e164` is what the "call" links dial. Update both.
- Ask your developer to check four other spots that still repeat the hours as plain text (the top bar, the mobile menu, the vehicle page contact card, and one form message). They're listed in [CONTENT-CHECKLIST.md](CONTENT-CHECKLIST.md#business-information).

---

## Financing link and the payment calculator

Same file, `src/config/business.ts`:

```ts
financing: {
  applicationUrl: "https://www.700dealer.com/QuickQualify/807b82f244f643f3b7a7a6255772a0db-2020624",
  providerName: "700Credit QuickQualify",
  disclosure: "Explore competitive financing options. Approval, rates, and terms depend on lender requirements and applicant qualifications. Submitting an inquiry or pre-qualification does not guarantee approval.",
  calculatorExampleApr: 8.9,
},
```

- `applicationUrl` is the secure application every "Get Pre-Qualified" button opens. If 700Credit gives you a new link, change it here and it updates everywhere.
- `calculatorExampleApr` is the **example** interest rate the payment estimator starts with (8.9%). Customers can change it. It is always labeled an estimate, never an offer. Change the number, or ask your developer to remove the calculator, if you'd rather not show a rate at all.
- `disclosure` is the fine print under the financing sections. Don't remove it, and don't add a specific rate anywhere on the site — that's an advertising-compliance problem waiting to happen.

---

## Reviews, FAQ, and guides

| What | File | Notes |
| --- | --- | --- |
| Customer reviews | `src/content/reviews.ts` | Author name, review text, source. Star ratings are only shown if they come from a platform that can be linked, so nothing is displayed as a rating today. |
| FAQ | `src/content/faq.ts` | Grouped questions and answers. The answers are also given to Google as structured data, so keep them factual and don't add promises. |
| Car-buying guides | `src/content/blog.ts` | Seven articles. Each has a title, description, date, and body made of paragraphs, headings, lists, and callouts. |
| Team | `src/content/team.ts` | Name, title, and bio for each person. |

Adding a review is as simple as copying an existing block and changing the text:

```ts
{
  id: "first-last",
  author: "First L.",
  body: "What the customer said.",
  rating: null,
  source: "Google",
  sourceUrl: "https://link-to-the-review",
},
```

Only publish reviews the customer actually wrote, and keep the wording as they wrote it (light punctuation fixes are fine).

---

## Where leads go

Every form on the site — availability, test drive, appointment, financing inquiry, trade-in, vehicle locator, delivery, service, service-contract quote, contact, inventory alert — goes through the same path:

1. The customer sees a confirmation on screen with a **reference number** (like `AS-M1ABCDEF-1A2B`). Ask for it when they call.
2. An internal notification email is prepared with the customer's name, phone, email, preferred contact method, the vehicle, and everything they entered. Financial details and VINs are left out of that email on purpose; they're in the CRM or the stored lead.
3. The customer receives a confirmation email with the reference number and your hours.
4. If they gave a phone number **and** checked the text-message consent box, they get a text.
5. The lead is sent to your CRM (if connected).

**Important:** email, texts, and CRM delivery only actually happen once those webhooks are connected (next section). Until then, everything is logged but nothing is sent.

**Appointments** are always "requested," not "confirmed," until someone confirms them — either your scheduling tool answers automatically, or a team member confirms and the confirmation email/text goes out. The site will never tell a customer their appointment is confirmed on its own.

### Reading leads during development or on your own server

When the site runs on a normal server (or on a developer's machine), each lead is appended to `.data/leads.ndjson` — one lead per line, in JSON. Trade-in photos land in `.data/uploads/<reference number>/`.

To read the file:

```powershell
# Windows PowerShell — newest 20 leads, main fields only
Get-Content .data\leads.ndjson -Tail 20 |
  ForEach-Object { $_ | ConvertFrom-Json } |
  Select-Object createdAt, type, firstName, lastName, phone, email, id |
  Format-Table
```

```bash
# macOS/Linux (with jq installed)
tail -n 20 .data/leads.ndjson | jq '{createdAt, type, firstName, lastName, phone, email, id}'
```

That folder contains customer information: don't email it around, keep it backed up, and keep it off shared drives.

**On Vercel-style hosting there is no file** — the server can't keep files between requests. That's why connecting a CRM or email webhook isn't optional there.

---

## Connecting email, texts, and your CRM

The website doesn't send email or texts by itself. It sends the information to a web address you provide (a "webhook"), and that service does the sending. The easiest option is Zapier (Make and n8n work the same way).

**Example: get lead emails through Zapier**

1. In Zapier, create a Zap with the trigger **Webhooks by Zapier → Catch Hook**. Copy the URL it gives you.
2. Give that URL to your developer to set as `EMAIL_WEBHOOK_URL`.
3. Add an action: **Gmail / Outlook → Send Email**, using the fields from the webhook: `to`, `subject`, `text`, and `replyTo`.
4. Turn the Zap on and submit a test form on the website.

The same pattern works for:

| What you want | Environment variable | What the website sends |
| --- | --- | --- |
| Emails actually sent | `EMAIL_WEBHOOK_URL` | `to`, `from`, `subject`, `text`, `replyTo`, `tags` |
| Text messages | `SMS_WEBHOOK_URL` | `to`, `body` (already includes "Reply STOP to opt out") |
| Leads into your CRM | `CRM_WEBHOOK_URL` | `event: "lead.created"` and the full lead |
| Automatic appointment booking | `SCHEDULING_WEBHOOK_URL` | The requested date, time, vehicle, and customer |

Every request is signed so the receiving side can prove it came from your website. Your developer sets these values in the hosting dashboard; details are in [ARCHITECTURE.md](ARCHITECTURE.md#integrations-and-webhook-contracts).

---

## The chat assistant

The "Ask about our inventory" button opens a chat that answers questions about the vehicles listed on your site: price, mileage, drivetrain, colors, what fits a budget, your hours, and where to go for financing or a trade-in. It only uses your listings — it can't invent a vehicle or promise a price, an approval, or that a car is still available.

- Out of the box it runs on a built-in question-answering engine that costs nothing.
- With an Anthropic API key it becomes much more capable and answers free-form questions in English or Spanish, billed by usage.
- It can be switched off entirely.

See [INVENTORY-ASSISTANT.md](INVENTORY-ASSISTANT.md).

---

## Who to call for what

| Situation | Who |
| --- | --- |
| A vehicle is sold, the price changed, photos or descriptions need updating | You, or [Your web contact] following the inventory steps above |
| The website is down, shows an error page, or a form stops working | [Your web developer / hosting contact] |
| Hours, phone number, address, or email changed | [Your web developer] — one file, small change |
| The financing application link doesn't work | 700Credit support (they own the QuickQualify application), then [Your web developer] to update the link |
| Leads stopped arriving | [Your web developer] — check the webhook/CRM connection first |
| Email to info@autoselectgroups.com stopped working | Your email provider / domain host — this is separate from the website |
| Domain, DNS, or SSL certificate questions | [Your domain registrar] and [Your web developer] |
| Google Business Profile, reviews, or map listing | You (Google Business Profile), with the website details from `src/config/business.ts` |
| Legal wording on the privacy policy or terms | Your attorney, then [Your web developer] to publish the change |

Fill in the bracketed names and numbers and keep this page where the team can find it.

---

## Good habits

- Update `status` to `sold` the same day a vehicle sells. Nothing frustrates a shopper more than driving out for a car that's gone.
- Add photos and a real description before featuring a vehicle on the homepage.
- Run `npm run inventory:check` (or ask for it) once a week and clear the warnings.
- Never publish a claim you can't back up: no guaranteed approvals, no invented rates, no "A-rated," no made-up statistics. The site was rebuilt specifically to remove those.
- When something on the site is wrong, write down the page address and what you expected — that's usually all your developer needs.
