// Creates the fixed development accounts. Safe to run repeatedly.
// Never run against production: it refuses unless ALLOW_SEED=true.
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { user } from '#/db/schema'
import { auth } from '#/lib/auth'
import { DEV_ACCOUNTS, DEV_PASSWORD } from '#/lib/dev-accounts'

async function ensureAccount(
  account: (typeof DEV_ACCOUNTS)[keyof typeof DEV_ACCOUNTS],
  role: 'trainer' | 'client',
) {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, account.email),
  })
  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        name: account.name,
        email: account.email,
        password: DEV_PASSWORD,
      },
    })
  }
  await db.update(user).set({ role }).where(eq(user.email, account.email))
  console.log(`${existing ? 'kept' : 'created'} ${role}: ${account.email}`)
}

async function main() {
  if (process.env.ALLOW_SEED !== 'true') {
    throw new Error(
      'Refusing to seed: set ALLOW_SEED=true (dev and PR previews only).',
    )
  }
  await ensureAccount(DEV_ACCOUNTS.trainer, 'trainer')
  await ensureAccount(DEV_ACCOUNTS.client, 'client')
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
