import { useLocale, useT } from '#/i18n'
import { formatDay, formatTime } from '#/lib/format'
import type { SessionView } from '#/server/views'

// Drawn from three variables only (DESIGN.md): border, leading edge, and
// text weight. Accent appears only on a live session. Never red.
const SETTLED = new Set<SessionView['status']>([
  'completed',
  'cancelled',
  'no_show',
  'missed',
  'substituted',
  'rested',
])

function frame(status: SessionView['status']): string {
  switch (status) {
    case 'unscheduled':
      return 'border border-dashed border-rock bg-transparent'
    case 'rescheduled':
      return 'border border-transparent bg-sunken'
    case 'confirmed':
      return 'border border-hairline border-s-[3px] border-s-hairline bg-raised'
    case 'in_progress':
      return 'border border-water border-s-[3px] border-s-water bg-raised'
    default:
      return 'border border-hairline bg-raised'
  }
}

/** The credit outcome, always in words on a settled PT session with a package. */
function creditLine(
  session: SessionView,
  t: ReturnType<typeof useT>,
): string | null {
  if (session.kind !== 'pt') return null
  if (!session.packageId) {
    return SETTLED.has(session.status) || session.status === 'booked'
      ? t.credit.payAsYouGo
      : null
  }
  if (session.status === 'completed' || session.creditOutcome === 'consumed') {
    return t.credit.used
  }
  if (SETTLED.has(session.status)) return t.credit.returned
  return null
}

export function SessionCard({
  session,
  timeZone,
  mode,
}: {
  session: SessionView
  timeZone: string
  /** `day` for Today (client name, time), `detail` for a client's history. */
  mode: 'day' | 'detail'
}) {
  const t = useT()
  const locale = useLocale()
  const settled = SETTLED.has(session.status)
  const credit = creditLine(session, t)
  const time = session.start ? formatTime(session.start, timeZone, locale) : '—'
  const title =
    mode === 'day' ? session.clientName : t.location[session.location]
  const meta = [
    mode === 'detail' && session.start
      ? formatDay(session.start, timeZone, locale)
      : null,
    mode === 'day' ? t.location[session.location] : session.packageName,
  ].filter(Boolean)

  return (
    <article
      className={`flex items-start gap-4 rounded-md px-4 py-4 ${frame(session.status)}`}
    >
      <p
        className={`numeric min-w-14 text-[1.25rem] leading-7 ${
          settled || session.status === 'rescheduled'
            ? 'font-normal text-rock'
            : 'font-semibold text-iron'
        }`}
      >
        {time}
      </p>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className={`type-body ${settled ? 'text-rock' : 'font-medium text-iron'}`}
        >
          <bdi>{title}</bdi>
        </p>
        {meta.length ? (
          <p className="type-detail text-rock">
            {meta.map((part, i) => (
              <span key={i}>
                {i > 0 ? ' · ' : ''}
                <bdi>{part}</bdi>
              </span>
            ))}
          </p>
        ) : null}
        <p className="type-detail text-rock">
          {t.status[session.status]}
          {credit ? ` · ${credit}` : ''}
        </p>
      </div>
    </article>
  )
}
