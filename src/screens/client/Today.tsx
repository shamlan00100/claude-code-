import { Link } from 'react-router-dom'
import { CalendarCheck, MapPin, Clock, ChevronRight, MessageCircle, TrendingUp } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { todaySession, clients } from '@/mock'

const me = clients[0] // Yusuf Almannai

const macros = [
  { label: 'Protein', value: 118, target: 160, unit: 'g' },
  { label: 'Carbs', value: 190, target: 260, unit: 'g' },
  { label: 'Fat', value: 54, target: 75, unit: 'g' },
]

const activity = [
  { id: 'a1', icon: MessageCircle, text: 'Coach Fahad left a note on Back Squat', time: '2h ago' },
  { id: 'a2', icon: TrendingUp, text: 'New PR: Back Squat 100kg × 5', time: 'Yesterday' },
]

export function Today() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Today" meta={`Tue, Aug 12 · ${me.streakDays}-day streak`} showHome />

      <div className="flex flex-col gap-5 px-5 pb-8 pt-4">
        {/* Next session */}
        <div className="rounded-md border border-primary/25 bg-surface-raised p-4 shadow-glow">
          <p className="text-label text-primary">Next session · {todaySession.startTime}</p>
          <h2 className="mt-1 font-display text-heading-lg text-ink">{todaySession.dayLabel}</h2>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-body-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {todaySession.gym}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> ~{todaySession.estMinutes} min · {todaySession.exerciseCount} exercises
            </span>
          </div>
          <Button asChild variant="primary" size="lg" className="mt-4 w-full">
            <Link to="/app/log">Start session</Link>
          </Button>
        </div>

        {/* Macros */}
        <section className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-heading-md">Today's nutrition</h2>
            <Link to="/app/meals" className="flex items-center text-body-sm font-semibold text-primary">
              Log a meal <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {macros.map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex items-baseline justify-between text-body-sm">
                  <span className="font-semibold text-ink">{m.label}</span>
                  <span className="tabular text-ink-soft">
                    {m.value}
                    <span className="text-ink-faint">/{m.target}{m.unit}</span>
                  </span>
                </div>
                <Progress value={Math.round((m.value / m.target) * 100)} />
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming PT session */}
        <section className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
          <h2 className="mb-3 text-heading-md">Upcoming with your coach</h2>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary-soft">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body-lg font-semibold">In-person session with Fahad</p>
              <p className="text-body-sm text-ink-soft">Thu, Aug 14 · 6:00 PM · Warehouse Gym</p>
            </div>
          </div>
          <p className="mt-3 text-body-sm text-ink-soft">
            {me.sessionCreditsLeft} session{me.sessionCreditsLeft === 1 ? '' : 's'} left on your package · renews {formatDate(me.renewsOn)}
          </p>
        </section>

        {/* Coach activity */}
        <section>
          <h2 className="mb-2.5 text-eyebrow uppercase text-ink-soft">Coach activity</h2>
          <ul className="flex flex-col gap-2">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface/60 px-3.5 py-3">
                <a.icon className="h-4 w-4 shrink-0 text-accent" />
                <span className="min-w-0 flex-1 truncate text-body-md text-ink">{a.text}</span>
                <span className="shrink-0 text-body-sm text-ink-faint">{a.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
