# Focus PT — Design System

**Direction: Iron & Chalk**
**Status: approved for build (Step 2 of 3 complete — tokens, components, and all 7 screens shipped as a running prototype)**

This document is the build brief. It should be pasted into Lovable ahead of the real Supabase rebuild — everything in it is a decision, not a suggestion, and the reasoning is included so it survives a rebuild by someone who wasn't in the room.

---

## 1. The direction

**Iron & Chalk** treats the app like the equipment it's meant to sit next to: a loaded barbell, chalk on your palms, a number written on a whiteboard before it's forgotten. It is light, not dark — a deliberate move against the near-black-plus-neon look every training app defaults to (Hevy, Whoop, Strong, and this product's own previous version). The ground is chalk-dust, not paper-cream and not carbon-black. The one thing every screen is allowed to borrow personality from is the loaded bar itself: plates, collars, the weight of iron.

Three directions were explored (see `/screenshots/step1-comparison.png` for the original comparison): a physical, plate-and-collar system (chosen); a coach's paper logbook; and a Gulf-night scoreboard. Iron & Chalk won because it's the most legible one-handed, mid-set, in bad light — the actual condition the hero screen has to survive — and because its signature element (the plate glyph) is the one idea in all three that couldn't be reskinned onto a different product.

**Why this isn't the cliché:** no near-black background, no acid-green or electric-blue accent, no glassmorphism, no big-number-on-a-card as the hero move, no emoji as iconography. The palette is warm and structural; the personality lives in thick borders, a condensed industrial display face, and one custom glyph — not in gradients or glow.

---

## 2. Colour tokens

All colour is expressed as CSS custom properties in `H S% L%` form, consumed through Tailwind via `hsl(var(--token))`. Never hardcode a hex in a component — every token has a role name, and the role is what components reference.

| Token | Value (HSL) | Approx. hex | Role |
|---|---|---|---|
| `--background` | `42 22% 91%` | `#EDEAE3` | Chalk-dust ground. The app's base surface — never pure white. |
| `--surface` / `--surface-raised` | `0 0% 100%` | `#FFFFFF` | Cards, sheets, anything sitting on the ground. |
| `--surface-sunken` | `43 20% 86%` | `#E3DFD5` | Recessed wells: track fills, skeleton loaders, disabled inputs. |
| `--ink` | `40 6% 10%` | `#1C1B19` | Primary text **and** the system's structural border colour. Iron & Chalk draws borders, not shadows. |
| `--ink-soft` | `44 5% 40%` | `#6B6860` | Secondary text — descriptions, meta lines. |
| `--ink-faint` | `43 8% 57%` | `#9B9689` | Tertiary text, placeholders, disabled labels, "last session" references. |
| `--border-subtle` | `39 14% 75%` | `#C9C3B8` | Knurl-grey hairline — dividers, ghost borders, muted badges. |
| `--primary` (iron) | `5 59% 44%` | `#B23A2E` | Iron-oxide. Every primary action, every "this is what you're doing right now" state (active set border, primary CTA). Spend it on one thing per screen. |
| `--accent` (brass) | `36 46% 45%` | `#A67C3D` | Brass. Celebratory and advisory — PR badges, coach notes, the second-most-important thing on the screen. Never used for a primary CTA. |
| `--success` | `103 21% 39%` | `#5B7A4F` | Verified, synced, on-track. An olive, not a mint — stays inside the warm palette. |
| `--warning` | `42 59% 44%` | `#B08A2E` | Needs attention, not yet urgent — "check this," "2 credits left." |
| `--destructive` (rust) | `6 64% 34%` | `#8C2A1F` | A darker, "oxidised" iron — errors, deletion, "out of credits," "inactive 9 days." Distinct enough from `--primary` to never be confused with a normal action. |
| `--ring` | `5 59% 44%` | `#B23A2E` | Focus ring — always iron, always visible, never suppressed. |

Every semantic colour also ships a `-foreground` (text-on-fill) and a `-soft` (10–15% tint for badges/banners) variant. See `tailwind.config.ts` → `theme.extend.colors`.

**Why no near-black + single accent:** that palette is the default the brief explicitly ruled out, and it's also the wrong tool for a screen used sweaty and one-handed — a warm, higher-contrast ground with a heavy ink border reads faster in bad light than white text floating on black.

---

## 3. Typography

Two families, doing two different jobs. Never introduce a third.

- **Display — "Big Shoulders Display."** Condensed, industrial, stencil-adjacent. Used for every number that matters (weight, reps, RPE, rest timer, screen titles) and nothing else. It's the typeface equivalent of the numbers stencilled on a plate.
- **Body — "Inter."** Everything you read in sentences: descriptions, coach notes, empty-state copy, nav labels' sibling text.
- **Mono — "JetBrains Mono"** is loaded and reserved for a future tabular-data view (e.g. exported logs); not used on any of the seven v1 screens, where Big Shoulders Display's `tabular-nums` handles all digit alignment instead.

| Token | Size / line-height | Weight / tracking | Use |
|---|---|---|---|
| `display-xl` | 56 / 1.0 | 900 / ‑0.01em | Reserved for hero numeric moments (e.g. a stat we want to dominate a screen). |
| `display-lg` | 40 / 1.05 | 900 / ‑0.01em | Screen-level hero numbers — bodyweight, lift trend headline. |
| `display-md` | 28 / 1.1 | 800 / 0 | Card-level numbers — meal kcal total, per-macro grams. |
| `display-sm` | 22 / 1.15 | 800 / 0 | Set-row numbers — weight, reps, RPE, rest countdown. |
| `heading-lg` | 24 / 1.2 | 800 / 0 | Sheet/modal titles, week labels. |
| `heading-md` | 18 / 1.3 | 700 / 0 | Card titles, client names. |
| `heading-sm` | 15 / 1.3 | 700 / 0.01em | Day/exercise names, list-row titles. |
| `body-lg` | 16 / 1.5 | 500 / 0 | Primary reading copy. |
| `body-md` | 14 / 1.5 | 400 / 0 | Secondary copy, descriptions. |
| `body-sm` | 13 / 1.45 | 500 / 0 | Captions, references ("Last 97.5×5"), timestamps. |
| `label` | 11 / 1.2 | 700 / 0.06em, uppercase | Field labels ("WEIGHT", "REPS"), badges. |
| `eyebrow` | 12 / 1.2 | 700 / 0.08em, uppercase | Section headers ("COACH ACTIVITY", "MEASUREMENTS"). |

**Rule:** headline chrome (top bar titles, primary buttons, nav labels, section eyebrows) is uppercase and tracked. Sentences are not — body copy is always sentence case, matching the copy voice (see §7). Uppercase is structural seasoning, not a paragraph style.

---

## 4. Spacing, radius, borders

- **Spacing** follows Tailwind's default 4px scale. No arbitrary pixel values in components — if a gap doesn't exist yet, extend the scale in `tailwind.config.ts`, don't hardcode it.
- **Radius** is a 4-step semantic scale, never a bare number in a component:
  - `radius-sm` (6px) — inputs, chips, small controls.
  - `radius-md` (10px) — cards, buttons, the default.
  - `radius-lg` (14px) — sheets, modals.
  - `radius-xl` (20px) — reserved for full-screen surfaces.
- **Borders carry the structure that shadows would carry in a softer system.** Default border is 2px solid `--ink`; the active/focused state of a card steps up to 3px `--primary`. Subtle dividers use 1–2px `--border-subtle`. A card almost never relies on `box-shadow` for hierarchy — `shadow-plate` and `shadow-card` exist only for the faint separation a white card needs off the chalk ground, not for depth theatre.

---

## 5. Motion

Motion is spent on three things and nowhere else: the plate glyph settling in, a PR badge announcing itself, and the rest timer's live countdown. Everything else (tab switches, accordion open/close, sheet presentation) uses the same restrained `fast`/`base` transition and stops there.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `fast` | 120ms | ease-out | Hover/press states, colour transitions. |
| `base` | 200ms | ease-out | Accordion expand, sheet slide, tab indicator. |
| `slow` / `settle` | 320ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Plate glyph appearing, PR badge pop-in — a slight overshoot, like a plate dropping onto a bar and settling. |

`prefers-reduced-motion: reduce` collapses every animation/transition to ~0ms globally (see `src/index.css`) — including the PR pop and plate settle. The rest timer's countdown is a text update, not an animation, so it's unaffected and keeps functioning.

---

## 6. The signature element

**The plate glyph.** Weight is never shown as a bare number alone — it's shown next to a small rendering of the plates that would actually be loaded on the bar to hit that number (greedy-decomposed from standard 25/20/15/10/5/2.5/1.25kg plates, one side, 20kg bar assumed). Biggest plate against the collar, each smaller plate overlapping in front, coloured by weight class (≥20kg ink, ≥5kg iron, <5kg brass). It's `src/components/pt/PlateGlyph.tsx`.

This is the one deliberate risk the brief asked for, and it's spent in the one place that earns it: the live set logger, where a trainer or client should be able to glance at a set and read "that's a big number" or "that's a small number" without doing arithmetic, one-handed, mid-rest.

---

## 7. Copy voice

- Active voice, sentence case, plain verbs. "Log a meal," not "Meal logging."
- An action keeps its exact name through a whole flow (the CTA that says "Log set 3" is the same verb used in the toast/confirmation, not "Submit" or "Save").
- Empty states are an invitation, not a dead end — every one pairs a plain-language explanation with a single next action ("No meals logged yet" → **Snap a meal**).
- Errors and low-confidence states say what happened and what to do, without apologising or faking precision. A low-confidence food item says "Unsure" with a visible, honest badge — never a smoothed-over guess presented as fact.

---

## 8. Bilingual / RTL

Every layout is built on Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, `rtl:rotate-180` on directional icons) instead of hardcoded `left`/`right`. No component assumes English word order or line length — button labels, badges, and card rows all use `flex-wrap`/`min-w-0`+truncate-avoidance patterns proven out during the build (see engineering note below). Flip `<html dir="rtl">` and the system should hold; Arabic labels will run longer than English in several spots (nav labels, badges), which is why label components wrap rather than clip by default.

---

## 9. Component base

shadcn/ui primitives (Button, Card, Badge, Input, Progress, Tabs, Switch, Avatar, Sheet, Separator, Skeleton), restyled at the token level — 2–3px `--ink` borders, uppercase-tracked primary buttons, no default shadcn rounded-full-everything softness. Full state matrix lives at `/components` in the running prototype and is captured in `/screenshots/components.png`.

Focus PT-specific primitives live in `src/components/pt/`: `PlateGlyph`, `PRBadge`, `RestTimer`, `SetRow`, `NumberStepper`, `ConfidenceTag`, `PortionAdjuster`, `CoachNote`, `OfflineBanner`, `MealPhoto`, `TrendChart`.

---

## 10. Engineering note for the Lovable rebuild

`src/lib/utils.ts`'s `cn()` helper extends `tailwind-merge`'s `font-size` class group with this system's semantic type tokens (`text-body-sm`, `text-heading-md`, etc.). Without that extension, tailwind-merge treats `text-body-sm` and a sibling `text-ink-soft` as the same "text colour" group and silently drops one of them — this cost real screen time to find (it was making avatar initials and several badges invisible) and will resurface in Lovable if the same custom `fontSize` scale is ported into `tailwind.config` without the matching `cn()` fix. Port both together.

---

## Reference

- Step 1 direction comparison: `/screenshots/step1-comparison.png`
- All seven screens + empty/loading states + component library: `/screenshots/*.png`
- Running prototype: `npm run dev`, start at `/` for a linked index of every screen.
