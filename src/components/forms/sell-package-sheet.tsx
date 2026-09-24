import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'

import { Sheet } from '#/components/sheet'
import { Button, ChoiceGroup, Field } from '#/components/ui'
import { useT } from '#/i18n'
import { sellPackageFn } from '#/server/trainer.functions'

type Location = 'gym' | 'home' | 'outdoor' | 'online'
type Structure = 'session_pack' | 'monthly'

const LOCATIONS: Location[] = ['gym', 'home', 'outdoor', 'online']

export function SellPackageSheet({
  clientId,
  today,
  open,
  onClose,
  onSold,
}: {
  clientId: string
  today: string
  open: boolean
  onClose: () => void
  onSold: () => void
}) {
  const t = useT()
  const router = useRouter()
  const [structure, setStructure] = useState<Structure>('session_pack')
  const [locations, setLocations] = useState<Location[]>(['gym'])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name')).trim()
    const sessions = Number(form.get('sessions'))
    const price = Number(String(form.get('price')).replace(',', '.'))
    const startsOn = String(form.get('startsOn'))
    const expiresOn = String(form.get('expiresOn')) || null

    const next: Record<string, string> = {}
    if (!name) next.name = t.errors.required
    if (!Number.isInteger(sessions) || sessions < 1) {
      next.sessions = t.errors.number
    }
    if (!form.get('price') || !Number.isFinite(price) || price < 0) {
      next.price = t.errors.number
    }
    if (!startsOn) next.startsOn = t.errors.required
    if (expiresOn && startsOn && expiresOn < startsOn) {
      next.expiresOn = t.errors.dateOrder
    }
    if (locations.length === 0) next.locations = t.errors.location
    setErrors(next)
    if (Object.keys(next).length) return

    setPending(true)
    try {
      await sellPackageFn({
        data: {
          clientId,
          name,
          structure,
          sessions,
          locations,
          startsOn,
          expiresOn,
          priceMinor: Math.round(price * 1000),
        },
      })
      await router.invalidate()
      onSold()
    } catch {
      setErrors({ name: t.errors.generic })
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.pkg.title}>
      <form className="flex flex-col gap-5 pt-2" onSubmit={onSubmit} noValidate>
        <Field
          label={t.pkg.name}
          name="name"
          autoComplete="off"
          placeholder={t.pkg.namePlaceholder}
          error={errors.name}
        />
        <ChoiceGroup<Structure>
          legend={t.pkg.structure}
          options={[
            { value: 'session_pack', label: t.pkg.sessionPack },
            { value: 'monthly', label: t.pkg.monthly },
          ]}
          value={[structure]}
          onChange={([value]) => setStructure(value)}
        />
        <Field
          label={
            structure === 'monthly'
              ? t.pkg.sessionsPerMonth
              : t.pkg.sessionsTotal
          }
          name="sessions"
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={10}
          className="numeric"
          error={errors.sessions}
        />
        <ChoiceGroup<Location>
          legend={t.pkg.locations}
          hint={t.pkg.locationsHint}
          error={errors.locations}
          multiple
          options={LOCATIONS.map((value) => ({
            value,
            label: t.location[value],
          }))}
          value={locations}
          onChange={setLocations}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={t.pkg.startsOn}
            name="startsOn"
            type="date"
            defaultValue={today}
            error={errors.startsOn}
          />
          <Field
            label={`${t.pkg.expiresOn} (${t.clients.optional})`}
            name="expiresOn"
            type="date"
            error={errors.expiresOn}
          />
        </div>
        <Field
          label={t.pkg.price}
          name="price"
          inputMode="decimal"
          placeholder={t.pkg.pricePlaceholder}
          dir="ltr"
          error={errors.price}
        />
        <p className="type-detail text-rock">{t.pkg.creditHint}</p>
        <Button type="submit" size="lg" disabled={pending}>
          {t.pkg.save}
        </Button>
      </form>
    </Sheet>
  )
}
