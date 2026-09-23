import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

import { isLocale } from '#/i18n'
import type { Locale } from '#/i18n'

export type Theme = 'system' | 'light' | 'dark'

export interface Prefs {
  locale: Locale
  theme: Theme
}

function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

const ONE_YEAR = 60 * 60 * 24 * 365

/** Language and theme live in cookies so the server renders the right
 *  direction and colours on first paint. */
export const getPrefs = createServerFn({ method: 'GET' }).handler((): Prefs => {
  const locale = getCookie('locale')
  const theme = getCookie('theme')
  return {
    locale: isLocale(locale) ? locale : 'en',
    theme: isTheme(theme) ? theme : 'system',
  }
})

export const setPrefs = createServerFn({ method: 'POST' })
  .validator((input: Partial<Prefs>) => ({
    locale: isLocale(input.locale) ? input.locale : undefined,
    theme: isTheme(input.theme) ? input.theme : undefined,
  }))
  .handler(({ data }) => {
    const options = { path: '/', maxAge: ONE_YEAR, sameSite: 'lax' as const }
    if (data.locale) setCookie('locale', data.locale, options)
    if (data.theme) setCookie('theme', data.theme, options)
  })
