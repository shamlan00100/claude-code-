import { createFileRoute } from '@tanstack/react-router'

import { Button, EmptyState, PageHeader } from '#/components/ui'
import { useLocale, useT } from '#/i18n'

export const Route = createFileRoute('/_app/today')({ component: Today })

function Today() {
  const t = useT()
  const locale = useLocale()
  const { user } = Route.useRouteContext()
  const date = new Intl.DateTimeFormat(
    locale === 'ar' ? 'ar-BH-u-nu-latn' : 'en-GB',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    },
  ).format(new Date())

  return (
    <>
      <PageHeader title={t.nav.today} subtitle={date} />
      {user.role === 'client' ? (
        <EmptyState message={t.today.clientEmpty} />
      ) : (
        <EmptyState
          message={t.today.trainerEmpty}
          action={<Button variant="secondary">{t.today.addClient}</Button>}
        />
      )}
    </>
  )
}
