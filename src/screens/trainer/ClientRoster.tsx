import { AlertTriangle, TrendingDown, CreditCard, CalendarClock, ChevronRight } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { clients } from '@/mock'
import { cn } from '@/lib/utils'
import type { Client } from '@/mock/types'

type Flag = { icon: typeof AlertTriangle; label: string; tone: 'destructive' | 'warning' }

function flagsFor(c: Client): Flag[] {
  const flags: Flag[] = []
  if (c.status === 'at-risk') flags.push({ icon: AlertTriangle, label: `Inactive ${c.lastActive.toLowerCase()}`, tone: 'destructive' })
  else if (c.status === 'slipping') flags.push({ icon: TrendingDown, label: 'Missed last 2 sessions', tone: 'warning' })
  if (c.sessionCreditsLeft === 0) flags.push({ icon: CreditCard, label: 'Out of session credits', tone: 'destructive' })
  else if (c.sessionCreditsLeft <= 2) flags.push({ icon: CreditCard, label: `${c.sessionCreditsLeft} credit${c.sessionCreditsLeft === 1 ? '' : 's'} left`, tone: 'warning' })
  const daysToRenew = Math.ceil((new Date(c.renewsOn).getTime() - Date.now()) / 86400000)
  if (daysToRenew <= 5) flags.push({ icon: CalendarClock, label: daysToRenew <= 0 ? 'Renewal overdue' : `Renews in ${daysToRenew}d`, tone: 'warning' })
  return flags
}

const priority: Record<Client['status'], number> = { 'at-risk': 0, slipping: 1, 'on-track': 2 }

export function ClientRoster() {
  const sorted = [...clients].sort((a, b) => {
    const flagDiff = flagsFor(b).length - flagsFor(a).length
    if (flagDiff !== 0) return flagDiff
    return priority[a.status] - priority[b.status]
  })

  const needsAttention = sorted.filter((c) => flagsFor(c).length > 0)
  const onTrack = sorted.filter((c) => flagsFor(c).length === 0)

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Roster" meta={`${clients.length} clients · ${needsAttention.length} need attention`} showHome />

      <div className="flex flex-col gap-5 px-5 pb-8 pt-4">
        <section>
          <h2 className="mb-2.5 text-eyebrow uppercase text-destructive">Needs attention</h2>
          <ul className="flex flex-col gap-2.5">
            {needsAttention.map((c) => (
              <ClientRow key={c.id} client={c} flags={flagsFor(c)} />
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2.5 text-eyebrow uppercase text-ink-soft">On track</h2>
          <ul className="flex flex-col gap-2.5">
            {onTrack.map((c) => (
              <ClientRow key={c.id} client={c} flags={[]} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function ClientRow({ client, flags }: { client: Client; flags: Flag[] }) {
  return (
    <li>
      <button
        type="button"
        className={cn(
          'flex w-full items-start gap-3 rounded-md border-2 bg-surface px-3.5 py-3 text-start transition-colors duration-fast hover:bg-ink/[0.03]',
          flags.some((f) => f.tone === 'destructive') ? 'border-destructive' : flags.length > 0 ? 'border-warning' : 'border-ink'
        )}
      >
        <Avatar className="mt-0.5">
          <AvatarFallback>{client.avatarInitials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-lg font-semibold text-ink">{client.name}</p>
          <p className="truncate text-body-sm text-ink-soft">{client.goal}</p>
          {flags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {flags.map((f, i) => (
                <Badge key={i} variant={f.tone} className="gap-1">
                  <f.icon className="h-2.5 w-2.5" strokeWidth={3} />
                  {f.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-faint rtl:rotate-180" />
      </button>
    </li>
  )
}
