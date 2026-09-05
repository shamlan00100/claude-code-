import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

const clientScreens = [
  { to: '/app/today', label: 'Today', desc: 'Next session, macros, coach activity' },
  { to: '/app/log', label: 'Live set logger', desc: 'The hero screen — weight, reps, RPE, PRs' },
  { to: '/app/meals', label: 'Snap a meal', desc: 'AI-estimated items, confidence, coach review' },
  { to: '/app/progress', label: 'Progress', desc: 'Bodyweight, lift trends, photos' },
]

const trainerScreens = [
  { to: '/coach/queue', label: 'Review queue', desc: 'Meal confirmations + form checks' },
  { to: '/coach/roster', label: 'Client roster', desc: 'Flags first — who needs attention' },
  { to: '/coach/programs', label: 'Program builder', desc: 'Weeks, days, sets, supersets' },
]

function ScreenList({ items }: { items: { to: string; label: string; desc: string }[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            className="group flex items-center justify-between gap-4 rounded-md border border-border-subtle bg-surface px-4 py-3.5 shadow-card transition-colors duration-fast hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0">
              <span className="block text-heading-sm">{item.label}</span>
              <span className="mt-0.5 block text-body-sm text-ink-soft">{item.desc}</span>
            </span>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-faint transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Home() {
  return (
    <div className="mx-auto min-h-full max-w-xl bg-background px-5 py-10">
      <p className="text-eyebrow uppercase text-primary">Focus PT — Prototype</p>
      <h1 className="mt-1.5 font-display text-display-lg">Scoreboard</h1>
      <p className="mt-2 max-w-sm text-body-lg text-ink-soft">
        Every screen below is fully navigable. Start with the client app or the trainer app, or open the component library.
      </p>

      <div className="mt-9">
        <h2 className="mb-3 text-eyebrow uppercase text-ink-soft">Client app</h2>
        <ScreenList items={clientScreens} />
      </div>

      <div className="mt-9">
        <h2 className="mb-3 text-eyebrow uppercase text-ink-soft">Trainer app</h2>
        <ScreenList items={trainerScreens} />
      </div>

      <div className="mt-9">
        <Link
          to="/components"
          className="flex items-center justify-between gap-4 rounded-md border border-dashed border-ink-faint px-4 py-3.5 text-heading-sm transition-colors duration-fast hover:border-primary/40 hover:text-primary"
        >
          Component library
          <ArrowUpRight className="h-5 w-5 text-ink-faint" />
        </Link>
      </div>

      <p className="mt-10 text-body-sm text-ink-faint">
        390×844 mobile-first · designed for English, built to survive Arabic RTL.
      </p>
    </div>
  )
}
