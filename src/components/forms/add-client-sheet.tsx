import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'

import { Sheet } from '#/components/sheet'
import { Button, Field } from '#/components/ui'
import { useT } from '#/i18n'
import { addClient } from '#/server/trainer.functions'

export function AddClientSheet({
  open,
  onClose,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  onAdded: (clientId: string) => void
}) {
  const t = useT()
  const router = useRouter()
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>(
    {},
  )
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const fullName = String(form.get('fullName')).trim()
    const email = String(form.get('email')).trim()
    const next: typeof errors = {}
    if (!fullName) next.fullName = t.errors.required
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = t.errors.email
    }
    setErrors(next)
    if (Object.keys(next).length) return

    setPending(true)
    try {
      const id = await addClient({
        data: { fullName, email, phone: String(form.get('phone')) },
      })
      formElement.reset()
      await router.invalidate()
      onAdded(id)
    } catch {
      setErrors({ fullName: t.errors.generic })
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.clients.addTitle}>
      <form className="flex flex-col gap-5 pt-2" onSubmit={onSubmit} noValidate>
        <Field
          label={t.clients.fullName}
          name="fullName"
          autoComplete="off"
          placeholder={t.clients.fullNamePlaceholder}
          error={errors.fullName}
          required
        />
        <Field
          label={`${t.clients.phone} (${t.clients.optional})`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder={t.clients.phonePlaceholder}
          dir="ltr"
        />
        <Field
          label={`${t.clients.email} (${t.clients.optional})`}
          name="email"
          type="email"
          autoComplete="off"
          dir="ltr"
          error={errors.email}
        />
        <Button type="submit" size="lg" disabled={pending}>
          {t.clients.save}
        </Button>
      </form>
    </Sheet>
  )
}
