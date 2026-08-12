# Focus PT — design prototype

A high-fidelity, clickable design prototype for Focus PT, an operating system for personal trainers launching in Bahrain. This is a **design deliverable, not a backend** — all data is mocked in `src/mock/`, nothing here talks to a database. It's built to port cleanly into Lovable against a real Supabase schema later.

Chosen direction: **Iron & Chalk**. Full rationale, tokens, type scale, spacing, and motion rules are in [`DESIGN.md`](./DESIGN.md) — paste that into Lovable as the build brief.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL — it starts at a linked index of all seven screens plus the component library. Client app under `/app/*`, trainer app under `/coach/*`, primitives at `/components`.

## Screenshot the prototype

```bash
npm run dev     # in one terminal
npm run shots   # in another
```

Captures every screen at 390×844 into `/screenshots`. Pass a single route name (e.g. `node scripts/screenshot.cjs set-logger`) to re-shoot one screen.

## Stack

Vite + React + TypeScript, Tailwind CSS with a fully semantic token theme (`tailwind.config.ts`), shadcn/ui primitives restyled to the direction (`src/components/ui/`), Focus PT-specific components (`src/components/pt/`), lucide-react icons, react-router for navigation.

## Structure

```
src/
  components/ui/     restyled shadcn primitives
  components/pt/      Focus PT signature components (plate glyph, rest timer, set row, ...)
  components/layout/  app shells, top bar, bottom nav
  screens/client/      Today, Live set logger, Snap a meal, Progress
  screens/trainer/     Review queue, Client roster, Program builder
  mock/                realistic Bahraini mock data
  routes/              prototype index + component library page
screenshots/           390×844 captures of every screen + states
DESIGN.md              the design system and reasoning
```
