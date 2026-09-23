import { createFileRoute } from '@tanstack/react-router'

import { EmptyState, PageHeader } from '#/components/ui'
import { useT } from '#/i18n'
import { requireRole } from './route'

export const Route = createFileRoute('/_app/clients')({
  beforeLoad: ({ context }) => requireRole(context.user, ['trainer']),
  component: Page,
})

function Page() {
  const t = useT()
  return (
    <>
      <PageHeader title={t.nav.clients} />
      <EmptyState message={t.clients.empty} />
      <p className="pt-4 type-detail text-rock">{t.common.comingNext}</p>
    </>
  )
}
