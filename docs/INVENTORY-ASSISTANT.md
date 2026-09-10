# Inventory questions assistant

A chat widget ("Ask about our inventory") on every page that answers shoppers' questions from the vehicles currently listed on the site. It runs in one of two modes:

| Mode | When | What it can do |
| --- | --- | --- |
| **Claude** | `ANTHROPIC_API_KEY` is set | Understands free-form questions in English or Spanish, searches inventory with tools, compares vehicles, estimates payments, shows vehicle cards, handles follow-up questions. |
| **Local rules engine** | No API key, or the API is unavailable | Answers the most common questions deterministically from the same data: hours, address, financing, trade-in, delivery, services, appointments, "which SUVs do you have", "anything under $12,000", "is this one AWD", stock-number lookups. |

Both modes read the same inventory repository the website uses, so answers always reflect the live listings. Both are wired the same way in the UI, so the widget is useful from day one with nothing configured.

Files: `src/components/assistant/InventoryAssistant.tsx` (widget), `src/app/api/assistant/route.ts` (endpoint), `src/lib/assistant/` (`claude.ts`, `local-engine.ts`, `prompt.ts`, `tools.ts`, `cards.ts`, `types.ts`).

## What it does

- Answers questions about listed vehicles: price, mileage, colors, drivetrain, engine, transmission, seating, listed features, photos, whether a 360 view exists, and status.
- Recommends vehicles that match a budget, body style, or need ("something for a family of six," "a truck under $40,000") and shows up to four vehicle cards with photo, price, mileage, and link.
- Explains the dealership's services and points to the right page: `/financing`, `/trade-in`, `/find-a-vehicle`, `/delivery`, `/services`, `/service-contracts`, `/schedule`, `/contact`.
- Knows which vehicle the shopper is looking at. On a vehicle page, the request includes the path, and the assistant is told which vehicle "this" refers to.
- Suggests starter questions, different on vehicle pages ("Tell me about this vehicle," "Is this one 4WD or AWD?") than elsewhere ("Which SUVs do you have?", "Anything under $12,000?").
- Keeps the conversation in the browser tab (`sessionStorage`) so it survives navigation, with a "new conversation" button.

## Grounding rules

These are enforced in the system prompt (`src/lib/assistant/prompt.ts`), the tool layer, and the local engine:

- **Only tool data.** Vehicle facts must come from a tool result in the same conversation. If something isn't in the data (options, accident history, tire age, MPG when not listed), it says so and offers to have the team confirm it.
- **Never promises availability.** Listings reflect the website; availability is confirmed by the team. No holds, reservations, discounts, or negotiated prices.
- **Prices exclude** tax, title, license, registration, and dealer fees, and it says so when discussing totals.
- **No credit promises.** Never quotes an APR as an offer or promises approval or terms. Payment answers use `estimate_payment` and always relay the assumptions and the "illustration only, not an offer of credit" disclaimer.
- **No sensitive data.** It never asks for a Social Security number, date of birth, income, or bank or card details, and tells shoppers not to share them. The local engine also detects an SSN-like pattern or those keywords and redirects to `/financing`.
- **Internal notes stay internal.** `internalNotes` are stripped from every tool result.
- **Sold vehicles are invisible.** Tools only see published vehicles.
- **It says it's automated** if asked, and offers a person by phone or the contact form.
- **Prompt injection is refused.** Instructions inside tool results or claims of special authority in user messages don't change the rules.
- **Short answers.** One to four sentences, or a short list, with relative links.

## Tools (Claude mode)

| Tool | Purpose |
| --- | --- |
| `search_inventory` | Search published vehicles by free text, make, model, body style, price range, max mileage, year range, drivetrain, fuel type, minimum seats, a feature, with a sort order and a limit (max 12). Returns compact records plus `total_matches` and `total_in_inventory`. |
| `get_vehicle_details` | Full listing for one vehicle by stock number, `/inventory/<slug>` URL, or the last 6 VIN characters: specs, engine, transmission, seats, MPG ("not listed" when missing), features, description, photo count, whether a 360 view exists, VIN last 6, date listed. |
| `estimate_payment` | Monthly payment for a price, with optional down payment, trade equity, APR, and term (36–84 months). Returns the payment, amount financed, the assumptions used, and a disclaimer. Without an APR it uses `business.financing.calculatorExampleApr` and labels it an example. |
| `show_vehicle_cards` | Renders up to four vehicle cards (photo, price, mileage, link) under the reply. |

The loop runs at most six tool rounds per question, streams text as it is produced, and shows "Checking our inventory…" while tools run.

## Enabling Claude

1. Create an API key in the [Anthropic Console](https://console.anthropic.com/).
2. Set it in your hosting environment (and in `.env.local` for development):

```bash
ANTHROPIC_API_KEY=sk-ant-…
ASSISTANT_MODEL=claude-opus-5     # default; any current Claude model id works
ASSISTANT_ENABLED=true            # default
```

3. Redeploy or restart. No other change is needed; the widget switches modes on its own.

Configuration in `src/lib/assistant/claude.ts`:

- Model: `ASSISTANT_MODEL`, default `claude-opus-5`; `max_tokens` 8000; SDK timeout 60s with 2 retries.
- Adaptive thinking at **low effort** — chat is latency-sensitive, and the system prompt tells the model to start answering promptly. (Skipped automatically for models that don't support it, such as Haiku.)
- **Server-side refusal fallbacks** (`betas: ["server-side-fallback-2026-07-01"]`, `fallbacks: "default"`) are enabled for models that support them (Opus 5, Fable 5.1). If a response comes back as a refusal, the widget shows a short, polite decline with the dealership's phone number instead of a raw refusal.
- The system prompt is byte-stable (no timestamps or per-request data) and marked for prompt caching; per-request context, such as which vehicle page the shopper is on, is added to the user turn.

**Automatic fallback to the local engine.** If the Claude call fails before any text has streamed — bad key, permissions, unknown model, rate limit, provider error, connection failure, malformed request — the request is answered by the local rules engine instead and the shopper sees no error. If it fails mid-answer, the widget shows "Sorry — I lost my connection. Please try again, or call us."

## Local rules engine

Used when there's no API key (and as the fallback above). It is deterministic and never invents facts. `src/lib/assistant/local-engine.ts`.

It recognizes:

- **Dealership questions** — hours, address and directions, "talk to a human," financing and credit, trade-ins, delivery, warranties and service contracts, automotive services, test drives and appointments.
- **A specific vehicle** — a stock number in the message (for example `N246488`), "this car"/"it" while on a vehicle page, or a make/model that matches exactly one listing. It then answers the parts of the question it can: mileage, price, colors, drivetrain, engine, transmission, MPG, seating, features, history report, availability, and an example monthly payment.
- **Searches** — make and model names (with aliases like "Chevy," "VW," "Bimmer"), body styles ("truck," "SUV," "minivan," "sedan"), "under $12,000" / "under 15k" / "over $20,000," "under 100k miles," "2016 or newer," "4x4/AWD," "third row / 7 seats," and sorting hints ("cheapest," "lowest mileage," "newest").
- **Spanish** — if the message looks Spanish, the reply adds "Para ayuda en español, llámenos al (210) 455-3050." (Confirm that Spanish-speaking help is actually available by phone before launch.)

Examples of what it returns:

| Question | Reply |
| --- | --- |
| "What are your hours?" | Hours from `business.hoursSummary` plus a link to `/schedule`. |
| "Which SUVs do you have?" | "We have N SUVs listed:" then a bulleted list of the matching vehicles with price, mileage, and drivetrain, plus vehicle cards. |
| "Anything under $12,000?" | The matching vehicles, sorted, up to five listed, with a link to the full inventory if there are more. |
| "Do you have a 4x4 truck?" | Pickups with AWD/4WD, or "I don't see any … listed right now" with the closest alternatives and a link to `/find-a-vehicle`. |
| "Tell me about N246488" | That vehicle's summary line and a link to its page. |
| "Is this one AWD?" (on a vehicle page) | The drivetrain from the listing, or that it isn't listed and the team can confirm. |
| "Here's my SSN…" | Asks them not to share that and points to the secure pre-qualification. |
| Anything unrelated | "I can answer questions about the N vehicles currently listed on our site…" with examples and the phone number. |

Every vehicle answer ends with the reminder that availability and details are confirmed by the team, with the "Check Availability" form and the phone number.

## Limits and rate limiting

- 20 questions per IP per 10 minutes (in-memory; per server instance). Over the limit, the API returns 429 and the widget shows a message suggesting a phone call.
- Message length: 1200 characters. Conversation: the last 12 turns are sent; the widget stores the last 30 messages per tab.
- The endpoint accepts at most 24 messages per request and requires the last one to be from the user.

## Privacy

- The widget shows a standing note: answers are automated and based on the listings, and shoppers shouldn't share financial or personal ID information.
- In Claude mode the conversation text is sent to Anthropic to generate the answer. This is disclosed in the privacy policy ("Inventory questions assistant" section) and linked from the widget. In local mode nothing leaves the server.
- The site does not write chat transcripts to disk. Errors are logged to the server log without the message text. Conversations stay in the visitor's own tab (`sessionStorage`) until they close it or press "new conversation".
- Analytics records only that a question was asked (`assistant_question` with the page path). Question text is never sent to analytics.
- If you later add transcript logging or human review, update the privacy policy to match.

## Cost

Claude mode is billed by usage on your Anthropic API account: you pay per token for every question and answer, so cost scales with how many shoppers use the widget. There is no cost in local mode.

Ways to control it:

- Set `ASSISTANT_MODEL` to a smaller, cheaper model — for example `claude-haiku-4-5` — if answer quality at lower cost matters more than nuance. (With Haiku the code automatically skips adaptive thinking and the server-side refusal fallbacks.)
- Leave `ANTHROPIC_API_KEY` unset and run the local engine only; it costs nothing and still answers the common questions.
- Set a monthly spend limit and usage alerts in the Anthropic Console.
- Prompt caching is already enabled for the system prompt, and the conversation is capped at 12 turns, which keeps per-question cost down.

## Testing

Local mode (no key):

```bash
npm run dev
# then open http://localhost:5240 and use the "Ask about our inventory" button
```

Straight to the API (streams newline-delimited JSON events):

```bash
curl -N -X POST http://localhost:5240/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Which SUVs do you have?"}]}'
```

Each line is one event: `{"type":"text","delta":"…"}`, `{"type":"status","message":"Checking our inventory…"}`, `{"type":"vehicles","vehicles":[…]}`, `{"type":"error","message":"…"}`, and finally `{"type":"done","mode":"local"}` or `{"type":"done","mode":"claude"}` — the `mode` tells you which engine answered.

Claude mode: add `ANTHROPIC_API_KEY` to `.env.local`, restart, and check that `done` reports `"mode":"claude"`.

Worth testing before launch: a vehicle that exists, a vehicle that doesn't, a budget question, a question with no matches, a question about a sold vehicle, a payment question, "are you a robot?", a request for a discount, and something off-topic.

## Turning it off

Set `ASSISTANT_ENABLED=false` and redeploy. The API then returns 404 for every request.

Note: the chat launcher is rendered by the root layout regardless of this setting, so with the API disabled the button still appears and shows an error when used. To remove it completely, also delete `<InventoryAssistant />` from `src/app/layout.tsx` (and its import).
