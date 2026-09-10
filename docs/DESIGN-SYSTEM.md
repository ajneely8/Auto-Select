# Design system

The visual language is a trustworthy local dealership, not a tech product: white and light-gray surfaces, charcoal text, deep navy for structure, and one signal red (from the logo tagline) for primary actions. Real vehicle photos carry the page.

All tokens live in the `@theme` block of `src/app/globals.css` and are available as Tailwind utilities (`bg-navy-900`, `text-slate`, `rounded-[var(--radius-md)]`, `shadow-[var(--shadow-card)]`, `font-display`, `animate-fade-up`, and so on).

## Color

Contrast ratios are WCAG 2.x values computed from the hex codes. AA requires 4.5:1 for body text, 3:1 for large text (24px, or 18.66px bold) and for UI component boundaries.

### Neutrals

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `white` | `#ffffff` | Page background, cards | — |
| `black` | `#07090c` | Rare; photo scrims | — |
| `ink` | `#111418` | Primary text, headings | 18.5:1 on white, 17.1:1 on surface |
| `charcoal` | `#22262d` | Dark sections (`Section tone="ink"`), hero caption bar | White text on it: 15.2:1 |
| `slate` | `#4a5260` | Secondary text, body copy in long-form | 7.9:1 on white, 7.3:1 on surface |
| `muted` | `#5d6573` | Tertiary text, captions, hints, fine print | 5.9:1 on white, 5.4:1 on surface, 5.0:1 on surface-2 |
| `line` | `#dfe3e8` | Hairline borders, dividers | 1.3:1 (decorative only) |
| `line-strong` | `#c5ccd5` | Input borders, outline buttons | 1.6:1 (see note below) |
| `surface` | `#f4f6f8` | Alternating page bands, inventory background | — |
| `surface-2` | `#eaedf1` | Image placeholders, skeletons | — |

### Brand

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `navy-950` | `#061224` | Utility bar, homepage hero | — |
| `navy-900` | `#0a1b33` | Page heroes, secondary buttons, selected states, chat header | White text on it: 17.3:1 |
| `navy-800` | `#102746` | Secondary button hover | White text: 15.0:1 |
| `navy-700` | `#18365f` | Inline links, icons | 12.1:1 on white, 11.2:1 on surface |
| `navy-100` | `#e6ecf5` | Text selection, light-button hover | — |
| `accent` | `#c8102e` | Primary buttons, eyebrows, focus ring, required asterisk | 5.9:1 on white; white text on it: 5.9:1 |
| `accent-hover` | `#a80d26` | Primary button hover | White text: 7.6:1 |
| `accent-soft` | `#fbe9ec` | Accent badge background | Accent text on it: 5.0:1 |
| Eyebrow on dark | `#ff8a9b` | Eyebrow text on navy heroes (`!text-[#ff8a9b]`) | 7.7:1 on navy-900 |

### Status

| Token | Hex | Soft background | Text on soft |
| --- | --- | --- | --- |
| `success` | `#17693a` | `success-soft` `#e7f4ec` | 6.0:1 |
| `warning` | `#8a5a00` | `warning-soft` `#fdf3dc` | 5.4:1 |
| `danger` | `#b3261e` | `danger-soft` `#fbeaea` | `danger` on white: 6.5:1 |

**Contrast notes**

- Every text/background pair used in the components meets AA for normal text.
- `line-strong` (`#c5ccd5`, 1.6:1) is used for input and outline-button borders. Fields are always labeled and get a red border plus text message on error, but the resting border itself is below the 3:1 non-text guideline. If an accessibility audit flags it, darken input borders to about `#868f9c` (3.3:1).
- Never put `muted` text on `navy` or `charcoal`; on dark sections use `text-white/70` or lighter.
- Never use `accent` for body text or large areas. It is for one primary action per view, eyebrows, and focus.

## Typography

| Role | Family | Token | Weights |
| --- | --- | --- | --- |
| Body, UI, forms | Inter | `--font-sans` (`font-sans`) | 400–700 (variable) |
| Headings, prices, eyebrows | Barlow Semi Condensed | `--font-display` (`font-display`) | 500, 600, 700 |

Both load through `next/font/google` with `display: swap` in `src/app/layout.tsx`. All `h1`–`h4` use the display face with `letter-spacing: -0.01em` and `text-wrap: balance`. Numbers that line up (prices, mileage, counts) use the `.tabular` utility.

### Scale in use

| Element | Size |
| --- | --- |
| Homepage hero `h1` | 2.75rem → 3.75rem (sm) → 4.25rem (lg), line-height 1.02 |
| Page hero `h1` (`PageHero`) | 2.25rem → 3rem (sm), line-height 1.05 |
| Vehicle page `h1` | 1.875rem → 2.5rem (sm) |
| Section title `h2` (`SectionHeader`) | 1.875rem → 2.5rem (sm), line-height 1.08 |
| Vehicle price | 2.25rem display bold |
| Long-form `h2` / `h3` (`.prose-page`) | 1.6rem / 1.25rem |
| Long-form body (`.prose-page`), section intros | 1.0625rem (17px), line-height 1.7 |
| Body | 1rem (16px) |
| Form controls, `md` buttons | 0.9375rem (15px) |
| Secondary text, labels | 0.875rem (14px) |
| Eyebrow (`.eyebrow`) | 0.8125rem, 600, uppercase, 0.12em tracking, accent color |
| Captions, badges, fine print | 0.75rem (12px); assistant disclaimer 0.6875rem |

## Radii

Small and consistent. Fully round shapes are reserved for floating controls over photos (favorite button, gallery arrows, 360 start button), the chat launcher and suggestion chips, filter chips, and count dots.

| Token | Value | Use |
| --- | --- | --- |
| `--radius-xs` | 2px | Badges, small overlays |
| `--radius-sm` | 4px | Buttons, inputs, controls |
| `--radius-md` | 6px | Cards, panels, gallery, 360 viewer |
| `--radius-lg` | 8px | Dialogs, chat panel, mobile filter drawer |

## Shadows

| Token | Value | Use |
| --- | --- | --- |
| `--shadow-card` | `0 1px 2px rgb(17 20 24 / .06), 0 1px 1px rgb(17 20 24 / .04)` | Resting cards and panels |
| `--shadow-raised` | `0 8px 24px -8px rgb(17 20 24 / .18), 0 2px 4px rgb(17 20 24 / .06)` | Card hover, floating buttons |
| `--shadow-overlay` | `0 24px 48px -12px rgb(6 18 36 / .35)` | Chat panel and launcher, overlays |

## Spacing and layout

- Tailwind's default 4px spacing scale. No custom spacing tokens.
- `.container-page`: max width 1280px; horizontal padding 16px, 24px from 640px, 32px from 1024px.
- `Section`: vertical padding 56px, 80px from 640px.
- `SectionHeader`: 32px below (40px from 640px).
- Anchor offset: `scroll-padding-top: 96px` so headings aren't hidden under the sticky header.
- Inventory: 280px filter sidebar + fluid results grid on desktop; filters move into a bottom-sheet dialog below 1024px.
- Vehicle page: media column + 400px sticky lead card on desktop; on mobile the order is media, lead card, details.
- Photos render at 4:3 in cards and the gallery; the homepage hero image is 16:10; the 360 stage is 16:9.

## Motion

| Token / pattern | Duration | Easing |
| --- | --- | --- |
| `--ease-out` | — | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| `animate-fade-up` (panels, success messages, chat) | 260ms | `--ease-out` |
| `animate-fade-in` (photos, floating buttons, errors) | 180ms | ease-out |
| `animate-chip-in` (filter chips) | 160ms | `--ease-out` |
| Reveal on scroll (`[data-reveal]`) | 300ms opacity + 12px rise | `--ease-out` |
| Button color transitions | 150ms | default |
| Card hover lift (2px) and header shrink | 200ms | default |
| 360 zoom transition | 160ms | ease-out |

**Reduced motion** (`prefers-reduced-motion: reduce`): all animations and transitions drop to ~0ms, smooth scrolling is turned off, reveal-on-scroll is skipped (content is simply visible), card hover lift is disabled, the 360 auto-rotate control is hidden, and chat/back-to-top scrolling jumps instead of animating. Reveal is also opt-in via JavaScript, so content is never hidden when scripts fail.

## Components

### Buttons (`src/components/ui/Button.tsx`)

`Button` renders a `<button>`; `ButtonLink` renders a Next.js `Link` (or an `<a target="_blank" rel="noopener noreferrer">` with `external`). `buttonClasses(variant, size)` gives the same styles to other elements.

| Variant | Look | Use |
| --- | --- | --- |
| `primary` | Accent red, white text | The single most important action in a view: Check Availability, Get Pre-Qualified, Book an Appointment, form submit. |
| `secondary` | Navy, white text | Strong secondary action on light backgrounds. |
| `outline` | White with `line-strong` border | Secondary actions next to a primary button. |
| `ghost` | Text only, surface hover | Low-emphasis actions in toolbars. |
| `light` | White on dark sections | Primary-weight action inside navy/charcoal sections. |
| `outline-light` | White outline on dark | Secondary action inside dark sections. |

| Size | Min height | Use |
| --- | --- | --- |
| `sm` | 36px | Dense toolbars and the scrolled header only. |
| `md` (default) | 44px | Standard. |
| `lg` | 48px | Heroes, form submits, mobile full-width actions. |

Rules: one `primary` per view (a card, a form, a hero). Labels are verbs that say what happens next. Never use `sm` for a primary mobile action.

### Sections (`src/components/ui/Section.tsx`)

- `Section` with `tone`: `white` (default), `surface` (alternate bands), `navy` and `ink` (dark; add `on-dark` automatically so focus rings turn white). Alternate `white` and `surface`; use at most one or two dark sections per page.
- `SectionHeader`: optional eyebrow, title, intro, right-aligned action, `align="center"` for short process sections. Pass `id` and set `labelledBy` on the `Section`.
- `PageHero`: navy header for inner pages with breadcrumbs, eyebrow, `h1`, intro, and optional actions. Its faint diagonal line texture is the only decorative pattern in the system.

### Cards

- `VehicleCard`: 4:3 photo, photo-count and 360 badges, favorite button, title, trim/body line, price, mileage, estimated payment, compare toggle. The whole card is clickable through the title link; interactive controls sit above that layer. Grid or list layout. `VehicleCardSkeleton` for loading.
- General panels: `rounded-[var(--radius-md)] border border-line bg-white` plus `shadow-[var(--shadow-card)]` when the panel should lift off a `surface` band.

### Forms (`src/components/forms/`)

- Every lead form is wrapped in `FormShell`, which adds the hidden form type, honeypot, timing and attribution fields, the error summary, success state, and submit button.
- Fields come from `fields.tsx`: `TextField`, `SelectField`, `TextareaField`, `CheckboxField`, `RadioGroupField`, `FileField`, `ContactFields` (name, email, phone, preferred contact method, message), `ConsentFields` (SMS and marketing checkboxes, both unchecked by default), `FormSection`.
- Controls: 4px radius, `line-strong` border, accent border plus a soft accent ring on focus, `danger` border on error.
- Labels sit above fields. Required fields show a red asterisk with "(required)" for screen readers; optional fields say "(optional)".
- Validation runs on blur, then live while the field is wrong, then on submit (first invalid field receives focus), and again on the server. Messages are specific ("Please enter a valid 10-digit U.S. phone number.").
- Success replaces the form with a confirmation, the reference number, and the phone number.

### Badges (`src/components/ui/Badge.tsx`)

Tones: `neutral`, `navy`, `success` (Available), `warning` (Sale Pending, In Transit), `accent`, `dark` (overlays on photos). 2px radius, 12px semibold. Badges state facts; they are not buttons.

### TodoFlag

`<TodoFlag>` renders a dashed amber "TODO · …" label for content Auto Select still has to confirm. It is visible to everyone, including in production builds. Rules:

- Use it only for facts that need the dealership's confirmation, never for design notes.
- Every flag is listed in [CONTENT-CHECKLIST.md](CONTENT-CHECKLIST.md#visible-todo-flags-on-pages).
- No page with a TodoFlag should launch; resolve the item and delete the flag (and its "Staff note" wrapper, where present).

### Other patterns

- Breadcrumbs (`seo/Breadcrumbs.tsx`) on every inner page, with matching `BreadcrumbList` schema; `tone="dark"` inside `PageHero`.
- Staff-note asides: dashed `line-strong` border on `surface`, "Staff note" label; they only hold TodoFlags and should disappear before launch.
- Fine print and disclosures: `text-xs text-muted`, placed directly under the thing they qualify (price, calculator, financing CTA).

## Do and don't

**Do**
- Use real photos of the actual vehicle, the actual lot, and the actual team.
- Lead with the vehicle: photo, name, price, mileage, then the action.
- Keep one accent color and one primary button per view.
- Put disclosures next to the claim they qualify.
- Show "Ask us" or "Call for Price" when data is missing rather than guessing.
- Keep the phone number one tap away on every page.

**Don't**
- No AI-generated images, illustrations of cars, or stock photos of smiling customers.
- No fake 360 spins built from a single photo, and no demo sequence in production.
- No gradient backgrounds, glows, glassmorphism, or decorative blobs. The only gradients are a readability scrim on the mobile homepage hero and the backdrop of the development-only demo 360 frames.
- No star ratings or aggregate-rating schema unless they come from a verifiable platform.
- No invented statistics, "A-rated," "since 19xx," or "guaranteed approval" style claims.
- No countdown timers, fake scarcity, or pre-checked consent boxes.
- No new colors outside the tokens above; if something needs emphasis, use weight, size, or navy.
- No autoplaying motion that the visitor didn't start, and nothing that ignores reduced-motion settings.
