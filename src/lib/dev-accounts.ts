// Fixed accounts for local development and PR preview environments only.
// They are created by `npm run db:seed` and never exist in production.
export const DEV_PASSWORD = 'focus-dev-password'

export const DEV_ACCOUNTS = {
  trainer: { name: 'Dev Trainer', email: 'trainer@dev.focuspt.test' },
  client: { name: 'Dev Client', email: 'client@dev.focuspt.test' },
} as const

export type DevAccount = keyof typeof DEV_ACCOUNTS
