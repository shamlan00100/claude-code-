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
import { quickSignIn, quickSignInEnabled } from '#/lib/quick-sign-in'
import type { DevAccount } from '#/lib/dev-accounts'
import { getSessionUser } from '#/lib/session'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: async () => {
    if (await getSessionUser()) throw redirect({ to: '/today' })
  },
  loader: async () => ({ quick: await quickSignInEnabled() }),
  component: SignIn,
})

function SignIn() {
  const t = useT()
  const router = useRouter()
  const { quick } = Route.useLoaderData()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(undefined)
    const { error: signInError } = await authClient.signIn.email({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    setPending(false)
    if (signInError) {
      setError(t.auth.signInFailed)
      return
    }
    await router.navigate({ to: '/today' })
  }

  async function onQuick(as: DevAccount) {
    setPending(true)
    await quickSignIn({ data: as })
    await router.navigate({ to: '/today' })
  }

  return (
    <AuthLayout title={t.auth.signInTitle}>
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
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
          autoComplete="current-password"
          error={error}
          required
        />
        <Button type="submit" size="lg" disabled={pending}>
          {t.auth.signIn}
        </Button>
      </form>
      <p className="type-detail text-rock">
        {t.auth.noAccount}{' '}
        <Link to="/sign-up" className="font-medium text-iron underline">
          {t.auth.toSignUp}
        </Link>
      </p>
      {quick ? (
        <section className="flex flex-col gap-3 border-t border-hairline pt-6">
          <h2 className="type-detail font-medium text-rock">
            {t.auth.quickTitle}
          </h2>
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => onQuick('trainer')}
            >
              {t.auth.quickTrainer}
            </Button>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => onQuick('client')}
            >
              {t.auth.quickClient}
            </Button>
          </div>
        </section>
      ) : null}
    </AuthLayout>
  )
}
