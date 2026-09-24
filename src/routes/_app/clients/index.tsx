import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { AddClientSheet } from '#/components/forms/add-client-sheet'
import { Button, EmptyState, PageHeader } from '#/components/ui'
import { useT } from '#/i18n'
import { listClients } from '#/server/trainer.functions'

import { requireRole } from '../route'

export const Route = createFileRoute('/_app/clients/')({
  beforeLoad: ({ context }) => requireRole(context.user, ['trainer']),
  loader: () => listClients(),
  component: Clients,
})

function Clients() {
  const t = useT()
  const navigate = useNavigate()
  const clients = Route.useLoaderData()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <PageHeader title={t.nav.clients} />
        {clients.length ? (
          <div className="pb-6">
            <Button variant="secondary" onClick={() => setAdding(true)}>
              {t.clients.add}
            </Button>
          </div>
        ) : null}
      </div>

      {clients.length === 0 ? (
        <EmptyState
          message={t.clients.empty}
          action={
            <Button onClick={() => setAdding(true)}>{t.clients.add}</Button>
          }
        />
      ) : (
        <ul className="border-t border-hairline">
          {clients.map((client) => (
            <li key={client.id} className="border-b border-hairline">
              <Link
                to="/clients/$clientId"
                params={{ clientId: client.id }}
                className="flex min-h-14 items-center justify-between gap-4 py-3"
              >
                <bdi className="type-body font-medium text-iron">
                  {client.fullName}
                </bdi>
                {client.remaining === null ? (
                  <span className="type-detail text-rock">
                    {t.clients.noPackage}
                  </span>
                ) : (
                  <span className="type-detail text-rock">
                    <span className="numeric text-iron">
                      {client.remaining}
                    </span>{' '}
                    {t.clients.left}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <AddClientSheet
        open={adding}
        onClose={() => setAdding(false)}
        onAdded={(clientId) => {
          setAdding(false)
          void navigate({ to: '/clients/$clientId', params: { clientId } })
        }}
      />
    </>
  )
}
