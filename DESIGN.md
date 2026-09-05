# Focus PT — Design System

**Direction: Scoreboard**
**Status: v2 — supersedes the original Iron & Chalk build (see §9 for why)**

This document is the build brief. It should be pasted into Lovable ahead of the real Supabase rebuild — everything in it is a decision, not a suggestion, and the reasoning is included so it survives a rebuild by someone who wasn't in the room.

---

## 1. The direction

**Scoreboard** is a Gulf gym scoreboard reimagined for a warm petrol night: a deep teal-black ground, brass-gold digits, coral for what needs attention. It's dark, but deliberately not the near-black-plus-neon look every training app defaults to (Hevy, Whoop, Strong) — the ground has warmth (a teal bias, not true black) and the accent is brass gold, not acid green or electric blue. Glass and soft shadow do the elevation work that hard borders did in the previous pass; radius is generous; the interface reads like a considered, current product rather than a wireframe.

This was originally one of three directions explored in Step 1 (see `/screenshots/step1-comparison.png`). The first build shipped a different direction — **Iron & Chalk**, a light industrial system (chalk-dust ground, iron-oxide red, thick structural borders). It was reviewed and read as heavy, boxy, and dated rather than considered. Scoreboard was already fully specified from Step 1, so rather than inventing a fourth direction from scratch, this rebuild promotes it: same rigor, same signature element, a genuinely different surface language.

**Why this isn't the generic dark cliché:** the brief that shaped Step 1 explicitly ruled out near-black-plus-single-neon-accent, because it's what every fitness app already looks like. Scoreboard avoids that specific trap on purpose — petrol teal instead of true black, brass gold instead of acid green/electric blue, coral reserved for alerts rather than doubling as the primary action color. It's dark and contemporary because that's what the room asked for; it still has a point of view instead of defaulting to the safest version of "modern dark app."

---

## 2. Colour tokens

All colour is expressed as CSS custom properties in `H S% L%` form, consumed through Tailwind via `hsl(var(--token))`. Never hardcode a hex in a component — every token has a role name, and the role is what components reference.

| Token | Value (HSL) | Approx. hex | Role |
|---|---|---|---|
| `--background` | `197 40% 12%` | `#12232A` | Petrol-black ground. |
| `--surface` | `196 38% 17%` | `#1B333C` | Raised card / panel — the default card surface. |
| `--surface-raised` | `197 35% 20%` | `#223C46` | More elevated surfaces — active/hero cards, sheets. |
| `--surface-sunken` | `196 39% 10%` | `#0F1D22` | Recessed wells: track fills, skeleton loaders, photo placeholders. |
| `--ink` | `42 39% 88%` | `#EDE6D6` | Primary text — warm ivory, never pure white. |
| `--ink-soft` | `194 13% 63%` | `#93A6AC` | Secondary text — descriptions, meta lines. |
| `--ink-faint` | `194 12% 44%` | `#62767C` | Tertiary text, placeholders, "last session" references. |
| `--border-subtle` | `198 31% 25%` | `#2C4753` | The default hairline. Structure now comes from this plus `shadow-card`, not from thick borders. |
| `--primary` (brass gold) | `40 63% 55%` | `#D4A544` | Every primary action, every "this is what you're doing right now" state — active set border/glow, primary CTA, focus ring. Spend it on one thing per screen. |
| `--accent` (coral) | `13 73% 56%` | `#E1613F` | Alerts and celebration — PR badges, "skip rest," coach notes. Never a primary CTA. |
| `--success` | `133 29% 56%` | `#6FB07D` | Verified, synced, on-track. |
| `--warning` | `45 76% 57%` | `#E4B93D` | Needs attention, not yet urgent — distinct enough from `--primary` gold to stay legible when they sit side by side. |
| `--destructive` | `6 63% 46%` | `#C0392B` | Errors, deletion, "out of credits," "inactive 9 days" — a true red, kept apart from the coral accent so alert and celebration never look the same. |
| `--ring` | `40 63% 55%` | `#D4A544` | Focus ring — always gold, always visible, never suppressed. |

Every semantic colour also ships a `-foreground` (text-on-fill) and a `-soft` (dark, low-opacity tint for badges/banners) variant. See `tailwind.config.ts` → `theme.extend.colors`.

---

## 3. Typography

Two families now do the two jobs that three used to:

- **Space Grotesk** — every heading, every label, every button, all body copy. One face carries the whole UI, at different weights (400–700).
- **Space Mono** — every digit that matters: weight, reps, RPE, rest timer, kcal, bodyweight, lift numbers. Applied via the `font-mono` utility class specifically to numeric spans, never to headline text. This is the system's one piece of typographic character — numbers read as data, not as prose.

| Token | Size / line-height | Weight / tracking | Use |
|---|---|---|---|
| `display-xl` | 56 / 1.0 | 900 / ‑0.01em | Reserved for a hero numeric moment. |
| `display-lg` | 40 / 1.05 | 900 / ‑0.01em | Screen-level headlines (page titles). |
| `display-md` | 28 / 1.1 | 800 / 0 | Card-level numbers — meal kcal total. |
| `display-sm` | 22 / 1.15 | 800 / 0 | Set-row numbers — weight, reps, RPE, rest countdown (`font-mono`). |
| `heading-lg` | 24 / 1.2 | 800 / 0 | Sheet/modal titles, week labels. |
| `heading-md` | 18 / 1.3 | 700 / 0 | Card titles, client names. |
| `heading-sm` | 15 / 1.3 | 700 / 0.01em | Day/exercise names, list-row titles. |
| `body-lg` | 16 / 1.5 | 500 / 0 | Primary reading copy. |
| `body-md` | 14 / 1.5 | 400 / 0 | Secondary copy, descriptions. |
| `body-sm` | 13 / 1.45 | 500 / 0 | Captions, references, timestamps. |
| `label` | 11 / 1.2 | 700 / 0.06em | Field labels, small tags — the only place uppercase survives. |
| `eyebrow` | 12 / 1.2 | 700 / 0.08em, uppercase | Section headers ("Coach activity," "Measurements"). |

**Rule — a direct fix for the previous version's biggest complaint:** headline text, button labels, and nav items are **sentence case**, not shouting caps. Uppercase is now reserved for the smallest structural markers only (`label`/`eyebrow` tokens — field labels, section eyebrows, tag pills), never for a page title or a CTA. A page should read as designed, not announced.

---

## 4. Spacing, radius, borders, elevation

- **Spacing** follows Tailwind's default 4px scale. No arbitrary pixel values in components.
- **Radius** is a 4-step semantic scale, softer than a typical admin panel:
  - `radius-sm` (8px) — inputs, chips.
  - `radius-md` (16px) — cards, most buttons.
  - `radius-lg` (22px) — sheets, modals.
  - `radius-xl` (28px) — reserved for full-screen surfaces.
  - Buttons and pills round all the way to `rounded-full`.
- **Structure comes from elevation, not weight.** The default card border is a 1px hairline (`border-border-subtle`) plus `shadow-card` — a soft, dark, real drop shadow (`0 1px 3px rgb(0 0 0 / 0.22)`), not a heavy 2–3px outline. The one exception is the "right now" state — the active set card, the next-session hero — which gets a soft gold `shadow-glow` instead of a thicker border. That's the only place elevation gets loud.
- **Glass is spent in exactly two places:** the top bar and the bottom nav (`.glass` utility — `backdrop-filter: blur(16px) saturate(140%)` over a translucent surface). Sheets and cards stay solid. One deliberate glass move reads as a decision; glass everywhere reads as a template.

---

## 5. Motion

Unchanged in spirit from the previous pass — motion is spent on the plate glyph settling in, a PR badge announcing itself, and the rest timer's live countdown, and stops there.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `fast` | 120ms | ease-out | Hover/press states, colour transitions. |
| `base` | 200ms | ease-out | Accordion expand, sheet slide, tab indicator. |
| `slow` / `settle` | 320ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Plate glyph appearing, PR badge pop-in. |

`prefers-reduced-motion: reduce` collapses every animation/transition to ~0ms globally. The rest timer's countdown is a text update, not an animation, so it's unaffected.

---

## 6. The signature element

**The plate glyph**, unchanged in concept from v1: weight is never shown as a bare number alone — it's shown next to a rendering of the plates that would actually be loaded on the bar (greedy-decomposed from standard 25/20/15/10/5/2.5/1.25kg plates, one side, 20kg bar assumed). In the dark palette it reads as overlapping discs — gold for the plates closest to the collar, ivory-steel for the mid sizes, coral for the small fractional plates — like looking at the end of a loaded bar under gym lighting. `src/components/pt/PlateGlyph.tsx`.

---

## 7. Copy voice

Unchanged: active voice, sentence case, plain verbs. An action keeps its exact name through a whole flow. Empty states pair a plain-language explanation with a single next action. Low-confidence states say "Unsure," visibly, rather than smoothing a guess into a fact.

---

## 8. Bilingual / RTL

Every layout is built on Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, `rtl:rotate-180` on directional icons) instead of hardcoded `left`/`right`. No component assumes English word order or line length.

---

## 9. Why this replaced Iron & Chalk

The first build (light chalk ground, iron-oxide red, thick 2–3px structural borders, condensed all-caps display type) was reviewed against a real screen and read as **outdated**: too heavy/boxy, typography too shouty, and — the direct ask — closer to the sleek dark aesthetic of current fitness and SaaS apps than to what shipped. That's a legitimate call for the person who owns the product, and it's a bigger change than a polish pass, so it's recorded here rather than silently overwritten.

The response wasn't to build the generic version of "dark modern app" (near-black, one neon accent, glassmorphism everywhere) — that's exactly the AI-default look the original brief warned against, and defaulting to it here would trade one cliché for another. Instead this rebuild promotes **Scoreboard**, the direction from the original three-way comparison that was already built for a dark, contemporary reading — Gulf gym floodlights and brass gold, not Silicon Valley near-black — and gives it the full token/component/screen treatment Iron & Chalk had.

What actually changed, concretely:
- Palette: chalk-light → petrol-dark, iron-red → brass-gold, brass → coral.
- Type: Big Shoulders Display (condensed industrial caps) + Inter → Space Grotesk (headings/body) + Space Mono (digits only).
- Structure: thick 2–3px `border-ink` everywhere → 1px hairline + soft shadow, with a gold glow reserved for the one "active" state per screen.
- Case: uppercase-tracked titles, buttons, and nav → sentence case everywhere except small field labels and eyebrows.
- Radius: 6–20px scale → 8–28px scale, buttons fully rounded.

What didn't change: the screens' structure and content, the mock data, the plate-glyph signature element's concept, the copy voice, the RTL approach, and the component inventory. This was a surface-language rebuild on validated content, not a restart.

---

## 10. Component base

shadcn/ui primitives (Button, Card, Badge, Input, Progress, Tabs, Switch, Avatar, Sheet, Separator, Skeleton), restyled at the token level. Full state matrix lives at `/components` in the running prototype and is captured in `/screenshots/components.png`.

Focus PT-specific primitives live in `src/components/pt/`: `PlateGlyph`, `PRBadge`, `RestTimer`, `SetRow`, `NumberStepper`, `ConfidenceTag`, `PortionAdjuster`, `CoachNote`, `OfflineBanner`, `MealPhoto`, `TrendChart`.

---

## 11. Engineering notes for the Lovable rebuild

- **Routing:** the prototype uses `HashRouter`, not `BrowserRouter`, so it survives static hosting (GitHub Pages, the Artifact preview host) without server-side rewrites. Lovable's own hosting may not need this — check before porting the routing choice over, since `BrowserRouter` is the more standard default when a real server is involved.
- **`cn()` / tailwind-merge:** `src/lib/utils.ts` extends `tailwind-merge`'s `font-size` class group with this system's semantic type tokens (`text-body-sm`, `text-heading-md`, etc.). Without that extension, tailwind-merge treats a token like `text-body-sm` and a sibling `text-ink-soft` as the same "text colour" group and silently drops one of them — this cost real time to find in the first build (it was making avatar initials and several badges invisible) and will resurface in Lovable if the same custom `fontSize` scale is ported into `tailwind.config` without the matching `cn()` fix. Port both together.

---

## Reference

- Step 1 direction comparison: `/screenshots/step1-comparison.png`
- All seven screens + empty/loading states + component library: `/screenshots/*.png`
- Running prototype: `npm run dev`, start at `/` for a linked index of every screen.
