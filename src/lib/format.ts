import type { Locale } from '#/i18n'

// Western numerals in both languages: equipment and receipts use them.
function tag(locale: Locale): string {
  return locale === 'ar' ? 'ar-BH-u-nu-latn' : 'en-GB'
}

export function formatTime(iso: string, timeZone: string, locale: Locale) {
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
}

export function formatDay(iso: string, timeZone: string, locale: Locale) {
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}

/** A 'YYYY-MM-DD' date, shown as a calendar date (no timezone shift). */
export function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`))
}

/** BHD has three decimals: 250000 fils → "250.000". */
export function formatBhd(minor: number) {
  return (minor / 1000).toFixed(3)
}
