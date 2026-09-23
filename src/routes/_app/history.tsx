import { createFileRoute } from '@tanstack/react-router'

import { EmptyState, PageHeader } from '#/components/ui'
import { useT } from '#/i18n'
import { requireRole } from './route'

export const Route = createFileRoute('/_app/history')({
  beforeLoad: ({ context }) => requireRole(context.user, ['client']),
  component: Page,
})

function Page() {
  const t = useT()
  return (
    <>
      <PageHeader title={t.nav.history} />
      <EmptyState message={t.history.empty} />
      <p className="pt-4 type-detail text-rock">{t.common.comingNext}</p>
    </>
  )
}
