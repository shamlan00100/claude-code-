import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '#/db'
import * as schema from '#/db/schema'

// Railway sets RAILWAY_PUBLIC_DOMAIN per environment, so PR previews get the
// right callback URL without extra configuration.
const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : undefined)

export const auth = betterAuth({
  baseURL,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  advanced: { database: { generateId: 'uuid' } },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      // Set by the server only. Public sign-up always creates a trainer;
      // clients join through an invite (not built yet).
      role: {
        type: 'string',
        required: false,
        defaultValue: 'trainer',
        input: false,
      },
      locale: {
        type: 'string',
        required: false,
        defaultValue: 'en',
      },
    },
  },
  plugins: [tanstackStartCookies()],
})

export type Role = 'trainer' | 'client' | 'admin'
