# Deployment

Two supported ways to run the site: Vercel (recommended, matches `vercel.json`) or any Node 20.9+ server. Read [Vehicle photos must move first](#vehicle-photos-must-move-first) before scheduling the DNS cutover.

## Environment variables

Everything is optional for the site to boot, but the four marked **required in production** must be set before launch.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `https://autoselectgroups.com`. Used for canonical URLs, the sitemap, Open Graph, and links inside emails. Baked in at build time — redeploy after changing. |
| `CRON_SECRET` | **Yes** | Long random string (`openssl rand -hex 32`). Protects `/api/cron/*` and `/api/inventory/sync`. Until it is set, those routes return 401 in production. Vercel sends it automatically as `Authorization: Bearer …`. |
| `UNSUBSCRIBE_SECRET` | **Yes** | Long random string. Signs unsubscribe links. If left at the development default, unsubscribe links are refused in production. |
| `WEBHOOK_SIGNING_SECRET` | **Yes** (if you use webhooks) | Signs outbound webhooks and verifies the inbound scheduling webhook. Without it, outbound requests are unsigned and the inbound webhook rejects everything in production. |
| `INVENTORY_SOURCE` | No | `local` (default, uses `data/inventory.json`) or `feed`. |
| `INVENTORY_FEED_URL`, `INVENTORY_FEED_TOKEN`, `INVENTORY_REVALIDATE_SECONDS` | No | Feed URL (JSON array or `{ vehicles: [...] }`), optional bearer token, cache lifetime in seconds (default 900). |
| `LEAD_STORE` | No | `file` (default) or `none`. **Use `none` on Vercel.** |
| `LEAD_DATA_DIR` | No | Directory for the file adapters, default `.data`. |
| `LEAD_NOTIFY_EMAIL` | No | Where internal lead notices go. Defaults to `business.email`. |
| `EMAIL_WEBHOOK_URL`, `EMAIL_FROM` | No | Email delivery webhook and the From header. |
| `SMS_WEBHOOK_URL` | No | SMS delivery webhook (only used with customer consent). |
| `CRM_WEBHOOK_URL` | No | Receives `{ event: "lead.created", lead }`. **The safety net on serverless hosting.** |
| `SCHEDULING_WEBHOOK_URL` | No | Booking provider; must answer `{ "confirmed": true, "reference": "…" }` to confirm an appointment. |
| `TURNSTILE_SECRET_KEY` | No | Cloudflare Turnstile server key. **Leave unset:** the forms don't render a Turnstile widget yet, so setting it would reject every submission. Honeypot, timing checks, rate limits, and deduplication are always on. |
| `ANTHROPIC_API_KEY`, `ASSISTANT_MODEL`, `ASSISTANT_ENABLED` | No | See [INVENTORY-ASSISTANT.md](INVENTORY-ASSISTANT.md). |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT`, `NEXT_PUBLIC_ANALYTICS_REQUIRE_CONSENT` | No | First-party analytics endpoint and consent banner. Both are build-time values. |
| `NEXT_PUBLIC_SHOW_DEMO_360` | No | Keep `false` (or unset) in production. Unset in development shows the demo sequence. |

`NEXT_PUBLIC_*` values are compiled into the client bundle: changing one requires a rebuild, not just a restart. Leave a variable out entirely rather than setting it to an empty string; blank URL and email values fail the startup validation in `src/config/env.ts`.

## Option A — Vercel (recommended)

1. Push the repository to GitHub/GitLab and import it in Vercel. Framework preset: Next.js. Build command `npm run build`; no changes needed.
2. Add the environment variables above under **Settings → Environment Variables** (Production, and Preview if you want previews to work).
   - Set `LEAD_STORE=none`.
   - Set `CRM_WEBHOOK_URL` (and/or `EMAIL_WEBHOOK_URL`) so leads reach a person — see the serverless note below.
3. Deploy and test on the `*.vercel.app` URL. Preview and production-preview deployments are automatically `noindex` (robots disallows everything unless `VERCEL_ENV=production`).
4. Add the domain under **Settings → Domains** when you're ready for the [DNS cutover](#dns-cutover-from-wordpress).

### Cron jobs

`vercel.json` already declares them; Vercel picks them up on deploy and sends `Authorization: Bearer $CRON_SECRET` automatically.

| Path | Schedule (UTC) | Purpose |
| --- | --- | --- |
| `/api/inventory/sync` | `*/30 * * * *` | Refresh inventory from the feed, revalidate pages, report quality warnings. |
| `/api/cron/retry` | `*/10 * * * *` | Retry failed email/SMS/CRM webhooks. |
| `/api/cron/reminders` | `0 15 * * 1-6` | Opt-in alerts and reminders (15:00 UTC ≈ 10:00 a.m. Central in summer, 9:00 a.m. in winter). |

Check your Vercel plan's cron limits before deploying: lower tiers restrict how often cron jobs may run, and you may need to reduce the frequencies (for example to hourly or daily) or upgrade. Cron runs are visible under **Deployments → Cron Jobs**.

### Serverless storage note (important)

Vercel's filesystem is read-only apart from a temporary directory, and every request may run on a fresh instance. Anything the site writes to `LEAD_DATA_DIR` does not survive:

- **Leads:** set `LEAD_STORE=none` and rely on `CRM_WEBHOOK_URL` (plus the email webhook). Otherwise a lead is only in the email notification.
- **Trade-in photos:** with `LEAD_STORE=none` they are not stored; the lead records the file names only. If you need the photos, have the CRM/webhook collect them, or implement `LeadStore` against S3/Supabase/Drive.
- **Retry queue** (`retry-queue.json`, `dead-letter.ndjson`): not durable. A failed webhook delivery is logged and, in practice, lost. Replace `src/lib/integrations/retry-queue.ts` with a durable queue (Upstash QStash, SQS, a database table) if retries matter.
- **Inventory alerts and reminders** (`subscriptions.json`): not durable either. Until a durable store is in place, treat the alert signup and `/api/cron/reminders` as non-functional on Vercel, and consider removing the alert signup from the pages.
- **Rate limiting and duplicate detection** are in memory, so they are per instance. They still stop the obvious cases but are not a hard limit across a fleet; use Redis/Upstash for that.

Durable-storage work is a developer task; it is listed in [CONTENT-CHECKLIST.md](CONTENT-CHECKLIST.md#integrations-to-connect).

## Option B — Node server or VPS

Works without any of the serverless caveats: the file adapters (leads, uploads, retry queue, subscriptions) all work on a normal server.

```bash
git clone <repo> /var/www/auto-select
cd /var/www/auto-select
npm ci
cp .env.example .env.local   # then edit: fill in real values, delete unused lines
npm run build
npm start                    # serves on port 5240
```

Keep it running with PM2:

```bash
npm i -g pm2
pm2 start npm --name auto-select -- start
pm2 save
pm2 startup            # follow the printed instructions
```

Or systemd (`/etc/systemd/system/auto-select.service`):

```ini
[Unit]
Description=Auto Select website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/auto-select
Environment=NODE_ENV=production
EnvironmentFile=/var/www/auto-select/.env.local
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`sudo systemctl enable --now auto-select`.

Put nginx (or Caddy) in front for TLS and proxy to `http://127.0.0.1:5240`. **The proxy must forward the visitor's IP** — nginx: `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` and `proxy_set_header X-Real-IP $remote_addr;` — otherwise every visitor shares one rate-limit bucket (6 form submissions per 10 minutes for the whole site). Also raise `client_max_body_size` to at least `50m` for trade-in photo uploads.

### Cron on a server

```cron
*/30 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://autoselectgroups.com/api/inventory/sync >/dev/null
*/10 * * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://autoselectgroups.com/api/cron/retry   >/dev/null
0 9  * * 1-6 curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://autoselectgroups.com/api/cron/reminders >/dev/null
```

Put `CRON_SECRET=…` at the top of the crontab, or inline the value. If the server's timezone is Central, `0 9` sends reminders at 9:00 a.m. local.

### Data directory

`.data/` holds `leads.ndjson`, `uploads/`, `retry-queue.json`, `dead-letter.ndjson`, and `subscriptions.json`. It contains customer information:

- Make sure the Node process user owns it and that it is not inside any web-served path (it isn't by default).
- Restrict permissions (`chmod 700 .data`) and include it in your backups.
- It is git-ignored; deploying with `git pull` will not touch it. Set `LEAD_DATA_DIR` to a path outside the app directory if you deploy by replacing the folder.

## Vehicle photos must move first

Every photo in `data/inventory.json` currently points at `https://autoselectgroups.com/wp-content/uploads/...` — the **same domain** that will point at the new site.

**The moment DNS moves to the new host, those URLs stop resolving to WordPress and every vehicle photo breaks.** This has to be handled before cutover, not after the old site is shut down. Pick one:

1. **Move the files to a CDN or object store** (Cloudflare R2, S3 + CloudFront, Bunny, Cloudinary): download `/wp-content/uploads/...`, upload them, rewrite the `photos[].url` values in `data/inventory.json`, and add the new host to `images.remotePatterns` in `next.config.ts`.
2. **Serve them from an inventory feed** whose photo URLs already live on the DMS/provider's CDN, then set `INVENTORY_SOURCE=feed` (and add that host to `remotePatterns`).
3. **Self-host them** in `public/vehicles/<stock>/1.jpg` and use `/vehicles/...` paths. Simplest, but it puts image files in the repository and requires a redeploy for photo changes.
4. **Keep WordPress alive on a subdomain** (e.g. `legacy.autoselectgroups.com`), point the photo URLs there, and add that host to `remotePatterns`. A stop-gap, not a destination.

Whatever you choose: any host serving photos through `next/image` must be listed in `images.remotePatterns` or images will fail to load. (360 frames are plain `<img>` and are not affected.)

## DNS cutover from WordPress

1. **Two weeks before:** export the old site's URL list (WordPress sitemap or a crawl) and check it against [SITEMAP.md](SITEMAP.md#redirects-from-old-wordpress-urls). Add redirects for anything with traffic or backlinks.
2. **One week before:** migrate photos (above). Verify on the Vercel preview URL that every vehicle page shows its photos from the new host.
3. **Two days before:** lower the DNS TTL for the domain's A/CNAME records to 300 seconds. Record the current MX, TXT/SPF, DKIM, and any other records — **do not change them**; `info@autoselectgroups.com` email must keep working.
4. **Prepare the new site:** set `NEXT_PUBLIC_SITE_URL=https://autoselectgroups.com` and all production secrets, then deploy. Add both `autoselectgroups.com` and `www.autoselectgroups.com` in the host's domain settings and decide which one redirects to the other (keep whichever the old site used as canonical).
5. **Back up WordPress** (files and database) and keep the hosting account active for at least 30 days.
6. **Cut over:** replace the A/CNAME records with the values your host shows (Vercel prints them in Settings → Domains). Leave MX and mail-related records untouched. Wait for the certificate to be issued (usually minutes).
7. **Immediately after:** check the homepage, an inventory search, a vehicle page with photos, a form submission end to end, `https://autoselectgroups.com/robots.txt`, and `https://autoselectgroups.com/sitemap.xml`.
8. **Then:** raise the TTL back to a normal value (3600+), and submit the sitemap in Search Console.

### Old-URL redirects

Existing redirects are in `next.config.ts` (`/locate-your-vehicle`, `/car-buying-service`, `/delivery-request`, `/service-contract`, `/inventory/page/:n`). To add more:

```ts
{ source: "/old-path", destination: "/new-path", permanent: true },
```

For old vehicle URLs, either redirect them individually or send the whole pattern to `/inventory`:

```ts
{ source: "/vehicle-details/:rest*", destination: "/inventory", permanent: true },
```

Verify after deploy: `curl -I https://autoselectgroups.com/car-buying-service` should return `308` with a `location:` header.

## Post-launch checks

- [ ] `curl -s https://autoselectgroups.com/robots.txt` — allows crawling and lists the sitemap URL (a `Disallow: /` here means the deployment isn't marked production).
- [ ] `curl -s https://autoselectgroups.com/sitemap.xml | head` — real URLs on the live domain, and vehicle pages present.
- [ ] Google Search Console: add the property, verify, submit `https://autoselectgroups.com/sitemap.xml`, and check Page Indexing after a few days. Keep the old property if it exists so you can watch the migration.
- [ ] [Rich Results Test](https://search.google.com/test/rich-results): a vehicle page (Car/Offer + BreadcrumbList), the homepage (AutoDealer), and `/faq` (FAQPage) — no errors.
- [ ] Bing Webmaster Tools: submit the same sitemap (optional but cheap).
- [ ] Google Business Profile: confirm the website link, address, phone, and hours match `src/config/business.ts`.
- [ ] Submit one lead through each form and confirm it arrives where it should (CRM webhook, internal email, and the customer confirmation email).
- [ ] Check the financing button opens the 700Credit application over HTTPS.
- [ ] Test on a real phone over mobile data: homepage, inventory filters, a vehicle page, the photo gallery, and the chat widget.
- [ ] Confirm cron runs are succeeding (Vercel Cron Jobs tab, or `journalctl`/cron mail on a server) and that `/api/inventory/sync` returns warnings you expect.
- [ ] Run Lighthouse on the homepage, `/inventory`, and a vehicle page.
- [ ] Watch the server logs for `[inventory] skipped invalid vehicle`, `[integrations] … failed`, and `[leads] storage failed` for the first few days.

## Rollback

Keep the WordPress site backed up and its host active for at least 30 days. If something goes badly wrong, point the DNS records back to the old host; with a 300-second TTL during cutover, most visitors will follow within minutes. On Vercel you can also roll back to an earlier deployment instantly from the Deployments list.
