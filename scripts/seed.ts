// Creates the fixed development accounts: a trainer, and a client linked to
// them. Safe to run repeatedly. Refuses unless ALLOW_SEED=true, so it never
// runs in production.
import { and, eq } from 'drizzle-orm'

import { db } from '#/db'
import { clients, trainerClients, trainers, user } from '#/db/schema'
import { auth } from '#/lib/auth'
import { DEV_ACCOUNTS, DEV_PASSWORD } from '#/lib/dev-accounts'

async function ensureUser(
  account: (typeof DEV_ACCOUNTS)[keyof typeof DEV_ACCOUNTS],
  role: 'trainer' | 'client',
): Promise<string> {
  let row = await db.query.user.findFirst({
    where: eq(user.email, account.email),
  })
  if (!row) {
    await auth.api.signUpEmail({
      body: {
        name: account.name,
        email: account.email,
        password: DEV_PASSWORD,
      },
    })
    row = await db.query.user.findFirst({
      where: eq(user.email, account.email),
    })
    console.log(`created ${role}: ${account.email}`)
  }
  await db.update(user).set({ role }).where(eq(user.id, row!.id))
  return row!.id
}

async function main() {
  if (process.env.ALLOW_SEED !== 'true') {
    throw new Error(
      'Refusing to seed: set ALLOW_SEED=true (dev and PR previews only).',
    )
  }
  const trainerId = await ensureUser(DEV_ACCOUNTS.trainer, 'trainer')
  const clientUserId = await ensureUser(DEV_ACCOUNTS.client, 'client')

  await db.insert(trainers).values({ userId: trainerId }).onConflictDoNothing()
  // The client signed up through the trainer path above; clients never keep
  // a trainers row.
  await db.delete(trainers).where(eq(trainers.userId, clientUserId))

  let client = await db.query.clients.findFirst({
    where: eq(clients.userId, clientUserId),
  })
  if (!client) {
    ;[client] = await db
      .insert(clients)
      .values({
        userId: clientUserId,
        fullName: DEV_ACCOUNTS.client.name,
        email: DEV_ACCOUNTS.client.email,
      })
      .returning()
  }
  const link = await db.query.trainerClients.findFirst({
    where: and(
      eq(trainerClients.trainerId, trainerId),
      eq(trainerClients.clientId, client.id),
    ),
  })
  if (!link) {
    await db
      .insert(trainerClients)
      .values({ trainerId, clientId: client.id, status: 'active' })
  }
  console.log('dev accounts ready')
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
