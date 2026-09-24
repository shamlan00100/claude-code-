import { Link, createFileRoute } from '@tanstack/react-router'

import { SessionCard } from '#/components/session-card'
import { EmptyState, PageHeader } from '#/components/ui'
import { useLocale, useT } from '#/i18n'
import { getTrainerToday } from '#/server/trainer.functions'

export const Route = createFileRoute('/_app/today')({
  loader: ({ context }) =>
    context.user.role === 'trainer' ? getTrainerToday() : null,
  component: Today,
})

function Today() {
  const t = useT()
  const locale = useLocale()
  const today = Route.useLoaderData()
  const date = new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-BH-u-nu-latn' : 'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...(today ? { timeZone: today.timeZone } : {}),
    },
  ).format(new Date())

  if (!today) {
    return (
      <>
        <PageHeader title={t.nav.today} subtitle={date} />
        <EmptyState message={t.today.clientEmpty} />
      </>
    )
  }

  return (
    <>
      <PageHeader title={t.nav.today} subtitle={date} />
      {today.sessions.length === 0 && today.unscheduled.length === 0 ? (
        <EmptyState
          message={t.today.trainerEmpty}
          action={
            <Link
              to="/clients"
              className="inline-flex h-12 items-center rounded-sm border border-hairline px-5 font-semibold text-iron"
            >
              {t.nav.clients}
            </Link>
          }
        />
      ) : null}

      {today.unscheduled.length ? (
        <section className="flex flex-col gap-3 pb-7">
          <h2 className="type-detail font-medium text-rock">
            {t.clients.needsTime}
          </h2>
          {today.unscheduled.map((session) => (
            <Link
              key={session.id}
              to="/clients/$clientId"
              params={{ clientId: session.clientId }}
            >
              <SessionCard
                session={session}
                timeZone={today.timeZone}
                mode="day"
              />
            </Link>
          ))}
        </section>
      ) : null}

      {today.sessions.length ? (
        <section className="flex flex-col gap-3">
          {today.sessions.map((session) => (
            <Link
              key={session.id}
              to="/clients/$clientId"
              params={{ clientId: session.clientId }}
            >
              <SessionCard
                session={session}
                timeZone={today.timeZone}
                mode="day"
              />
            </Link>
          ))}
        </section>
      ) : null}
    </>
  )
}
