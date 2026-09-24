import { and, eq, ne } from 'drizzle-orm'

import { clients, trainerClients } from '#/db/schema'
import type { SessionUser } from '#/lib/session'

import type { DbOrTx } from './db-types'
import { ForbiddenError } from './errors'

// Every ownership check lives here, so server functions never compare IDs
// sent by the browser on their own.

export function requireTrainer(user: SessionUser | null): SessionUser {
  if (user?.role !== 'trainer') throw new ForbiddenError()
  return user
}

/** The trainer coaches this client (any relationship that hasn't ended). */
export async function assertCoaches(
  db: DbOrTx,
  trainerId: string,
  clientId: string,
): Promise<void> {
  const row = await db.query.trainerClients.findFirst({
    columns: { id: true },
    where: and(
      eq(trainerClients.trainerId, trainerId),
      eq(trainerClients.clientId, clientId),
      ne(trainerClients.status, 'ended'),
    ),
  })
  if (!row) throw new ForbiddenError()
}

/** The client record belonging to a signed-in client, if any. */
export async function clientIdForUser(
  db: DbOrTx,
  userId: string,
): Promise<string | null> {
  const row = await db.query.clients.findFirst({
    columns: { id: true },
    where: eq(clients.userId, userId),
  })
  return row?.id ?? null
}
