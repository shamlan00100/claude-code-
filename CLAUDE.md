# Focus PT

Mobile-first PWA for independent personal trainers. Trainers pay; clients use it free.
English and Arabic, both first-class, true RTL.

## The one idea

A **commitment renegotiation engine**. When a client can't make a session, the app never
leaves a silent gap. It asks for one of three specific responses and records whether it
was honoured:

- **Reschedule**: a new, specific time. The commitment stays open until it happens.
- **Substitute**: the client did something else instead (a run, padel, a class). Logged.
- **Rest**: skipped with a reason (sore, unwell, travelling, no time).

Only _no response at all_ is a missed session, and only that needs the trainer's attention.

## Scope

Built around the loop above:

1. **Booking**: trainer availability, client and trainer booking, recurring sessions.
2. **Session logging**: every exercise has a tracking type (weight + reps, reps, time,
   distance + time, time + level). Prefill from last time.
3. **Packages**: session packs and monthly plans; balances are derived, never stored.
4. **End-of-session body map**: one check-in per session (where it was felt, how hard,
   pain flagged separately), compared with the muscles the session targeted.
5. **AI nutrition**: photo or text in, a macro _range_ out, user corrections improve it.

Not now: payments processing, messaging, marketplace, leaderboards.

## Stack

- **TanStack Start** (React, file routes in `src/routes`), built with Vite, served by Nitro.
- **Postgres** with **Drizzle** (`src/db`). Migrations are generated files in `drizzle/`.
- **Better Auth** (`src/lib/auth.ts`), users stored in our own database.
- **Railway** hosts the app and Postgres. `railway.json` + `scripts/predeploy.sh`.

## Architecture rules

- **All authorisation happens in server code.** The browser never talks to the database.
  Every server function that reads or writes data checks who the user is and whether they
  may touch that row. Use `getSessionUser()` and put access checks in one place per
  entity; never trust IDs sent by the client without checking ownership.
- **The database enforces invariants that must never break**: foreign keys, check
  constraints, unique and exclusion constraints (e.g. no double-booking a trainer).
- **Multi-step changes run in one transaction** (copying a program on assign, applying a
  cancellation and its credit outcome).
- **Session state changes go through one function** that validates the transition and
  writes an audit row. Never update a session's status directly.
- **Balances are counted, never stored.** No `sessions_remaining` column anywhere.
- **Package rules are snapshotted at sale.** Changing a template never alters sold packages.
- **Assigning a program copies it.** Clients never share a live program row.
- **Client data belongs to the client**, not to the trainer relationship: history must
  survive a client changing trainers.
- **Store one unit per quantity**: kilograms, metres, seconds. Convert only for display.
- **Times are stored as `timestamptz`** and shown in the user's timezone.
- **Roles** (`trainer`, `client`, `admin`) are set by the server only. Public sign-up
  creates trainers; clients join by invite.

## Design

`DESIGN.md` is the reference: read it before building any component. The short version:

- Chalk, iron, rock, water. Tokens in `src/styles.css`; don't invent new ones.
- Primary buttons are iron fill with chalk text. **Water is never a button fill.**
- Missed, cancelled and no-show states are rock. **Never red, amber or orange.**
  Red (oxide) is only for destructive actions.
- IBM Plex Sans / IBM Plex Sans Arabic / IBM Plex Mono (all numerals, `numeric` utility).
  Fonts are self-hosted via `@fontsource`; no third-party requests.
- Navigation by moment: trainer Today · Clients · Programs · Profile; client Today ·
  Train · History · Profile. Four items max, labels always visible.
- Voice: short, factual, unbothered. No exclamation marks, no emoji, no guilt.

The **Impeccable** design skill is installed in `.claude/skills/impeccable` (instructions
only; see its `NOTICE.md`). Use its `audit`, `critique`, `polish`, `harden` and `clarify`
passes to review screens after building them. **DESIGN.md and this file win on any
conflict**; never let a skill change the palette, fonts, motion budget or state colours.

## Bilingual

- Every user-facing string lives in `src/i18n/en.ts` and `src/i18n/ar.ts` (typed: Arabic
  must have every key English has). No hardcoded strings.
- Use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start`, `end`), never left/right.
- Wrap LTR fragments (emails, codes) in `<bdi>`; numbers use the `numeric` utility.
- Western numerals (0–9) in both languages. Arabic is clear modern standard Arabic.
- Language and theme are cookies read on the server, so the first paint is correct.

## Working

```bash
npm run dev          # http://localhost:3000
npm run check        # typecheck + lint + tests + production build: run before every push
npm test             # database tests against a throwaway focuspt_test database
npm run db:generate  # after changing src/db/*.ts, creates a migration in drizzle/
npm run db:migrate   # applies migrations
npm run db:seed      # dev accounts (requires ALLOW_SEED=true)
```

- Never edit a migration that has been pushed; add a new one.
- Session status changes go through `src/server/session-transitions.ts`; program
  assignment through `src/server/programs.ts`; ownership checks through
  `src/server/access.ts`. Add a test in `tests/` for every new rule.
- **Never seed or show mock data in the product.** Empty states are real empty states.
  The only seed is the fixed dev accounts in `scripts/seed.ts`, for dev and PR previews.
- Dev accounts: `trainer@dev.focuspt.test` / `client@dev.focuspt.test`, password in
  `src/lib/dev-accounts.ts`. The "Development sign-in" buttons appear only when the
  server has `ENABLE_QUICK_SIGNIN=true`.
- After UI changes, screenshot the affected screens at phone width in English and
  Arabic, light and dark.
- Prefer one well-scoped change over a broad refactor.
