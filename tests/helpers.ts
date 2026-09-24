import { randomUUID } from 'node:crypto'

import { sql } from 'drizzle-orm'

import { db } from '#/db'
import { clients, exercises, trainerClients, trainers, user } from '#/db/schema'

/** Empties every table except the migration journal. */
export async function resetDatabase() {
  await db.execute(sql`
    do $$ declare r record; begin
      for r in select tablename from pg_tables where schemaname = 'public' loop
        execute 'truncate table ' || quote_ident(r.tablename) || ' restart identity cascade';
      end loop;
    end $$;
  `)
}

export async function makeTrainer() {
  const [row] = await db
    .insert(user)
    .values({
      name: 'Trainer',
      email: `trainer-${randomUUID()}@test.local`,
      role: 'trainer',
    })
    .returning()
  await db.insert(trainers).values({ userId: row.id })
  return row.id
}

export async function makeClientUser() {
  const [row] = await db
    .insert(user)
    .values({
      name: 'Client',
      email: `client-${randomUUID()}@test.local`,
      role: 'client',
    })
    .returning()
  return row.id
}

export async function makeClient(trainerId: string) {
  const [client] = await db
    .insert(clients)
    .values({ fullName: 'Client' })
    .returning()
  await db
    .insert(trainerClients)
    .values({ trainerId, clientId: client.id, status: 'active' })
  return client.id
}

export async function makeExercise(
  trackingType: (typeof exercises.$inferInsert)['trackingType'] = 'weight_reps',
) {
  const [row] = await db
    .insert(exercises)
    .values({ nameEn: `Exercise ${randomUUID()}`, trackingType })
    .returning()
  return row.id
}

/** Runs `fn` expecting Postgres to reject it; returns the constraint name. */
export async function violation(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn()
  } catch (error) {
    const cause = (error as { cause?: { constraint?: string } }).cause
    const direct = (error as { constraint?: string }).constraint
    return cause?.constraint ?? direct ?? String(error)
  }
  throw new Error('expected the database to reject this')
}
