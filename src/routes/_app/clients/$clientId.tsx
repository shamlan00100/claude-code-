import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { BookSessionSheet } from '#/components/forms/book-session-sheet'
import { SellPackageSheet } from '#/components/forms/sell-package-sheet'
import { SessionCard } from '#/components/session-card'
import { Button, Toast } from '#/components/ui'
import { useLocale, useT } from '#/i18n'
import { formatBhd, formatDate } from '#/lib/format'
import { utcToZoned } from '#/lib/time'
import { useToast } from '#/lib/use-toast'
import { getClientDetail } from '#/server/trainer.functions'
import type { PackageView } from '#/server/trainer.functions'

import { requireRole } from '../route'

export const Route = createFileRoute('/_app/clients/$clientId')({
  beforeLoad: ({ context }) => requireRole(context.user, ['trainer']),
  loader: ({ params }) =>
    getClientDetail({ data: { clientId: params.clientId } }),
  component: ClientDetail,
})

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 pt-7">
      <h2 className="type-detail font-medium text-rock">{title}</h2>
      {children}
    </section>
  )
}

function PackageRow({ pkg }: { pkg: PackageView }) {
  const t = useT()
  const locale = useLocale()
  const { balance } = pkg
  return (
    <div className="flex flex-col gap-2 rounded-md border border-hairline bg-raised p-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="type-body font-medium text-iron">
          <bdi>{pkg.name}</bdi>
        </p>
        <p className="type-detail text-rock">
          <bdi>
            <span className="numeric">{formatBhd(pkg.priceMinor)}</span> BHD
          </bdi>
        </p>
      </div>
      <p className="type-body text-iron">
        <span className="numeric font-semibold">{balance.remaining}</span>{' '}
        {t.pkg.of} <span className="numeric">{balance.included}</span>{' '}
        {t.pkg.left}
        {pkg.structure === 'monthly' ? ` ${t.pkg.thisMonth}` : ''}
        {balance.upcoming ? (
          <span className="text-rock">
            {' · '}
            <span className="numeric">{balance.upcoming}</span> {t.pkg.upcoming}
          </span>
        ) : null}
      </p>
      <p className="type-detail text-rock">
        {pkg.locations.map((location) => t.location[location]).join(' · ')}
        {pkg.expiresOn
          ? ` · ${t.pkg.expires} ${formatDate(pkg.expiresOn, locale)}`
          : ''}
      </p>
    </div>
  )
}

function ClientDetail() {
  const t = useT()
  const detail = Route.useLoaderData()
  const [sheet, setSheet] = useState<'package' | 'book' | null>(null)
  const [toast, setToast] = useToast()
  const today = utcToZoned(new Date(), detail.timeZone).date
  const firstLocation = detail.packages.at(0)?.locations.at(0) ?? 'gym'
  const { client } = detail

  return (
    <>
      <Link to="/clients" className="type-detail text-rock">
        {t.clients.back}
      </Link>
      <header className="flex flex-col gap-1 pt-2">
        <h1 className="type-title text-iron">
          <bdi>{client.fullName}</bdi>
        </h1>
        {client.phone || client.email ? (
          <p className="type-detail text-rock">
            <bdi>
              {[client.phone, client.email].filter(Boolean).join(' · ')}
            </bdi>
          </p>
        ) : null}
      </header>

      <Section title={t.clients.packages}>
        {detail.packages.length ? (
          detail.packages.map((pkg) => <PackageRow key={pkg.id} pkg={pkg} />)
        ) : (
          <p className="type-body text-iron">{t.clients.noPackages}</p>
        )}
        <div>
          <Button variant="secondary" onClick={() => setSheet('package')}>
            {t.clients.sellPackage}
          </Button>
        </div>
      </Section>

      {detail.unscheduled.length ? (
        <Section title={t.clients.needsTime}>
          {detail.unscheduled.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              timeZone={detail.timeZone}
              mode="detail"
            />
          ))}
        </Section>
      ) : null}

      <Section title={t.clients.upcoming}>
        {detail.upcoming.length ? (
          detail.upcoming.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              timeZone={detail.timeZone}
              mode="detail"
            />
          ))
        ) : (
          <p className="type-body text-iron">{t.clients.noSessions}</p>
        )}
      </Section>

      {detail.past.length ? (
        <Section title={t.clients.past}>
          {detail.past.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              timeZone={detail.timeZone}
              mode="detail"
            />
          ))}
        </Section>
      ) : null}

      {/* One primary action, anchored above the navigation. */}
      <div className="sticky bottom-20 pt-8">
        <Button size="lg" className="w-full" onClick={() => setSheet('book')}>
          {t.clients.bookSession}
        </Button>
      </div>

      <SellPackageSheet
        clientId={client.id}
        today={today}
        open={sheet === 'package'}
        onClose={() => setSheet(null)}
        onSold={() => {
          setSheet(null)
          setToast(t.pkg.sold)
        }}
      />
      <BookSessionSheet
        key={firstLocation}
        clientId={client.id}
        today={today}
        defaultLocation={firstLocation}
        open={sheet === 'book'}
        onClose={() => setSheet(null)}
        onBooked={(withTime) => {
          setSheet(null)
          setToast(withTime ? t.book.booked : t.book.savedWithoutTime)
        }}
      />
      <Toast message={toast} />
    </>
  )
}
