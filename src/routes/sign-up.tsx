import { useState } from 'react'
import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router'

import { AuthLayout } from '#/components/auth-layout'
import { Button, Field } from '#/components/ui'
import { useT } from '#/i18n'
import { authClient } from '#/lib/auth-client'
import { getSessionUser } from '#/lib/session'

export const Route = createFileRoute('/sign-up')({
  beforeLoad: async () => {
    if (await getSessionUser()) throw redirect({ to: '/today' })
  },
  component: SignUp,
})

function SignUp() {
  const t = useT()
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(undefined)
    const { error: signUpError } = await authClient.signUp.email({
      name: String(form.get('name')),
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    setPending(false)
    if (signUpError) {
      setError(t.auth.signUpFailed)
      return
    }
    await router.navigate({ to: '/today' })
  }

  return (
    <AuthLayout title={t.auth.signUpTitle}>
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        <Field
          label={t.auth.name}
          name="name"
          autoComplete="name"
          placeholder={t.auth.namePlaceholder}
          required
        />
        <Field
          label={t.auth.email}
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t.auth.emailPlaceholder}
          dir="ltr"
          required
        />
        <Field
          label={t.auth.password}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          hint={t.auth.passwordHint}
          error={error}
          required
        />
        <Button type="submit" size="lg" disabled={pending}>
          {t.auth.signUp}
        </Button>
      </form>
      <p className="type-detail text-rock">
        {t.auth.haveAccount}{' '}
        <Link to="/sign-in" className="font-medium text-iron underline">
          {t.auth.toSignIn}
        </Link>
      </p>
    </AuthLayout>
  )
}
