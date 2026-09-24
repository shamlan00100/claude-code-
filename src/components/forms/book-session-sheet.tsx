import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'

import { Sheet } from '#/components/sheet'
import { Button, ChoiceGroup, Field } from '#/components/ui'
import { useT } from '#/i18n'
import type { Messages } from '#/i18n/en'
import { bookSessionFn } from '#/server/trainer.functions'

type Location = 'gym' | 'home' | 'outdoor' | 'online'

const LOCATIONS: Location[] = ['gym', 'home', 'outdoor', 'online']

function ruleMessage(code: string, t: Messages): string {
  if (code === 'trainer_busy') return t.errors.trainer_busy
  if (code === 'package_location_not_included') {
    return t.errors.package_location_not_included
  }
  return t.errors.generic
}

export function BookSessionSheet({
  clientId,
  today,
  defaultLocation,
  open,
  onClose,
  onBooked,
}: {
  clientId: string
  today: string
  defaultLocation: Location
  open: boolean
  onClose: () => void
  onBooked: (withTime: boolean) => void
}) {
  const t = useT()
  const router = useRouter()
  const [location, setLocation] = useState<Location>(defaultLocation)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  async function save(form: HTMLFormElement, withTime: boolean) {
    const data = new FormData(form)
    const date = String(data.get('date'))
    const time = String(data.get('time'))
    const duration = Number(data.get('duration'))

    const next: Record<string, string> = {}
    if (withTime && !date) next.date = t.errors.required
    if (withTime && !time) next.time = t.errors.required
    if (!Number.isInteger(duration) || duration < 15 || duration > 240) {
      next.duration = t.errors.number
    }
    setErrors(next)
    if (Object.keys(next).length) return

    setPending(true)
    try {
      const result = await bookSessionFn({
        data: {
          clientId,
          location,
          durationMinutes: duration,
          ...(withTime ? { date, time } : {}),
        },
      })
      if (!result.ok) {
        setErrors({ time: ruleMessage(result.code, t) })
        return
      }
      await router.invalidate()
      onBooked(withTime)
    } catch {
      setErrors({ time: t.errors.generic })
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.book.title}>
      <form
        className="flex flex-col gap-5 pt-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void save(event.currentTarget, true)
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={t.book.date}
            name="date"
            type="date"
            defaultValue={today}
            min={today}
            error={errors.date}
          />
          <Field
            label={t.book.time}
            name="time"
            type="time"
            step={900}
            error={errors.time}
          />
        </div>
        <Field
          label={t.book.duration}
          name="duration"
          type="number"
          inputMode="numeric"
          min={15}
          max={240}
          step={15}
          defaultValue={60}
          className="numeric"
          error={errors.duration}
        />
        <ChoiceGroup<Location>
          legend={t.book.location}
          options={LOCATIONS.map((value) => ({
            value,
            label: t.location[value],
          }))}
          value={[location]}
          onChange={([value]) => setLocation(value)}
        />
        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" disabled={pending}>
            {t.book.save}
          </Button>
          <Button
            type="button"
            variant="quiet"
            disabled={pending}
            onClick={(event) => {
              const form = event.currentTarget.form
              if (form) void save(form, false)
            }}
          >
            {t.book.saveWithoutTime}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}
