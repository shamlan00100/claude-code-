import { createFileRoute, useRouter } from '@tanstack/react-router'

import { Button, PageHeader } from '#/components/ui'
import { useLocale, useT } from '#/i18n'
import type { Locale } from '#/i18n'
import { authClient } from '#/lib/auth-client'
import { setPrefs } from '#/lib/prefs'
import type { Theme } from '#/lib/prefs'

export const Route = createFileRoute('/_app/profile')({ component: Profile })

function Profile() {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const { user, prefs } = Route.useRouteContext()

  async function update(next: { locale?: Locale; theme?: Theme }) {
    await setPrefs({ data: next })
    await router.invalidate()
  }

  async function signOut() {
    await authClient.signOut()
    await router.navigate({ to: '/sign-in' })
  }

  const themes: { value: Theme; label: string }[] = [
    { value: 'system', label: t.profile.themeSystem },
    { value: 'light', label: t.profile.themeLight },
    { value: 'dark', label: t.profile.themeDark },
  ]

  return (
    <>
      <PageHeader title={t.profile.title} />
      <section className="flex flex-col gap-1 border-b border-hairline pb-6">
        <p className="type-heading text-iron">{user.name}</p>
        <p className="type-detail text-rock">
          <bdi>{user.email}</bdi>
        </p>
        <p className="type-detail text-rock">{t.profile.role[user.role]}</p>
      </section>

      <Choice
        legend={t.profile.language}
        options={[
          // Each language names itself, in its own script.
          { value: 'en', label: 'English', lang: 'en' },
          { value: 'ar', label: 'العربية', lang: 'ar' },
        ]}
        value={locale}
        onChange={(value) => update({ locale: value as Locale })}
      />
      <Choice
        legend={t.profile.theme}
        options={themes}
        value={prefs.theme}
        onChange={(value) => update({ theme: value as Theme })}
      />

      <div className="pt-8">
        <Button variant="secondary" onClick={signOut}>
          {t.profile.signOut}
        </Button>
      </div>
    </>
  )
}

function Choice({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: { value: string; label: string; lang?: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset className="flex flex-col gap-3 border-b border-hairline py-6">
      <legend className="type-detail font-medium text-rock">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              lang={option.lang}
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`h-12 rounded-sm border px-4 type-body ${
                selected
                  ? 'border-iron bg-raised font-medium text-iron'
                  : 'border-hairline text-rock'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
