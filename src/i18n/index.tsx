import { createContext, useContext } from 'react'

import { ar } from './ar'
import { en } from './en'
import type { Messages } from './en'

export type Locale = 'en' | 'ar'

const messages: Record<Locale, Messages> = { en, ar }

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'ar'
}

export function dirFor(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

const LocaleContext = createContext<Locale>('en')

export const LocaleProvider = LocaleContext.Provider

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

/** Returns the message tree for the current locale. */
export function useT(): Messages {
  return messages[useLocale()]
}
