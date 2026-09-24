import { and, asc, desc, eq, gte, inArray, isNull, lt, ne } from 'drizzle-orm'

import { db } from '#/db'
import {
  clients,
  packages,
  sessions,
  trainerClients,
  trainers,
} from '#/db/schema'
import { readSessionUser } from '#/lib/session.server'
import { utcToZoned, zonedToUtc } from '#/lib/time'

import { assertCoaches, requireTrainer } from './access'
import { bookPtSession } from './booking'
import type { BookInput } from './booking'
import { RuleError } from './errors'
import { packageBalance, sellPackage } from './packages'
import type { Balance, SellPackageInput } from './packages'
import { toSessionView } from './views'
import type { SessionView } from './views'

// Data for the trainer's screens. Server only: every function resolves the
// trainer from the session cookie and checks ownership before touching a row.

export async function currentTrainer() {
  const user = requireTrainer(await readSessionUser())
  const settings = await db.query.trainers.findFirst({
    where: eq(trainers.userId, user.id),
  })
  if (!settings) throw new RuleError('trainer_not_found')
  return { id: user.id, timeZone: settings.timezone }
}

export type RuleResult<T> = { ok: true; value: T } | { ok: false; code: string }

/** Rule errors travel to the browser as a code the UI translates. */
async function withRuleErrors<T>(fn: () => Promise<T>): Promise<RuleResult<T>> {
  try {
    return { ok: true, value: await fn() }
  } catch (error) {
    if (error instanceof RuleError) return { ok: false, code: error.code }
    throw error
  }
}

export interface PackageView {
  id: string
  name: string
  structure: 'session_pack' | 'monthly'
  locations: ('gym' | 'home' | 'outdoor' | 'online')[]
  status: string
  startsOn: string
  expiresOn: string | null
  priceMinor: number
  balance: Balance
}

async function activePackageViews(
  trainerId: string,
  clientId: string,
  timeZone: string,
): Promise<PackageView[]> {
  const rows = await db.query.packages.findMany({
    where: and(
      eq(packages.trainerId, trainerId),
      eq(packages.clientId, clientId),
      inArray(packages.status, ['active', 'paused']),
    ),
    orderBy: [asc(packages.createdAt)],
  })
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      name: row.name,
      structure: row.structure,
      locations: row.locations,
      status: row.status,
      startsOn: row.startsOn,
      expiresOn: row.expiresOn,
      priceMinor: row.priceMinor,
      balance: await packageBalance(db, row, timeZone),
    })),
  )
}

// ---------------------------------------------------------------------------

export interface ClientRow {
  id: string
  fullName: string
  /** Sessions left across active packages; null when none. */
  remaining: number | null
}

export async function listClientsForTrainer(): Promise<ClientRow[]> {
  const trainer = await currentTrainer()
  const rows = await db
    .select({ id: clients.id, fullName: clients.fullName })
    .from(trainerClients)
    .innerJoin(clients, eq(clients.id, trainerClients.clientId))
    .where(
      and(
        eq(trainerClients.trainerId, trainer.id),
        ne(trainerClients.status, 'ended'),
      ),
    )
    .orderBy(asc(clients.fullName))
  return Promise.all(
    rows.map(async (row) => {
      const views = await activePackageViews(
        trainer.id,
        row.id,
        trainer.timeZone,
      )
      return {
        ...row,
        remaining: views.length
          ? views.reduce((sum, view) => sum + view.balance.remaining, 0)
          : null,
      }
    }),
  )
}

export async function addClientForTrainer(input: {
  fullName: string
  phone: string | null
  email: string | null
}): Promise<string> {
  const trainer = await currentTrainer()
  return db.transaction(async (tx) => {
    const [client] = await tx
      .insert(clients)
      .values(input)
      .returning({ id: clients.id })
    await tx
      .insert(trainerClients)
      .values({ trainerId: trainer.id, clientId: client.id, status: 'active' })
    return client.id
  })
}

// ---------------------------------------------------------------------------

export interface ClientDetail {
  client: {
    id: string
    fullName: string
    phone: string | null
    email: string | null
  }
  packages: PackageView[]
  unscheduled: SessionView[]
  upcoming: SessionView[]
  past: SessionView[]
  timeZone: string
}

export async function clientDetailForTrainer(
  clientId: string,
): Promise<ClientDetail> {
  const trainer = await currentTrainer()
  await assertCoaches(db, trainer.id, clientId)
  const client = await db.query.clients.findFirst({
    columns: { id: true, fullName: true, phone: true, email: true },
    where: eq(clients.id, clientId),
  })
  if (!client) throw new RuleError('client_not_found')

  const now = new Date()
  const mine = and(
    eq(sessions.clientId, client.id),
    eq(sessions.trainerId, trainer.id),
  )
  const packageNames = await db
    .select({ id: packages.id, name: packages.name })
    .from(packages)
    .where(eq(packages.clientId, client.id))
  const nameOf = new Map(packageNames.map((row) => [row.id, row.name]))
  const view = (row: typeof sessions.$inferSelect) =>
    toSessionView(row, {
      packageName: row.packageId ? nameOf.get(row.packageId) : null,
    })

  const [unscheduled, upcoming, past] = await Promise.all([
    db
      .select()
      .from(sessions)
      .where(and(mine, isNull(sessions.scheduledStart)))
      .orderBy(asc(sessions.createdAt)),
    db
      .select()
      .from(sessions)
      .where(and(mine, gte(sessions.scheduledEnd, now)))
      .orderBy(asc(sessions.scheduledStart))
      .limit(20),
    db
      .select()
      .from(sessions)
      .where(and(mine, lt(sessions.scheduledEnd, now)))
      .orderBy(desc(sessions.scheduledStart))
      .limit(20),
  ])

  return {
    client,
    packages: await activePackageViews(trainer.id, client.id, trainer.timeZone),
    unscheduled: unscheduled.map(view),
    upcoming: upcoming.map(view),
    past: past.map(view),
    timeZone: trainer.timeZone,
  }
}

// ---------------------------------------------------------------------------

export async function sellPackageForTrainer(
  input: Omit<SellPackageInput, 'trainerId'>,
): Promise<string> {
  const trainer = await currentTrainer()
  await assertCoaches(db, trainer.id, input.clientId)
  const sold = await db.transaction((tx) =>
    sellPackage(tx, { ...input, trainerId: trainer.id }),
  )
  return sold.id
}

export async function bookSessionForTrainer(
  input: Omit<BookInput, 'trainerId' | 'packageId'>,
): Promise<RuleResult<string>> {
  const trainer = await currentTrainer()
  return withRuleErrors(async () => {
    const session = await db.transaction((tx) =>
      bookPtSession(tx, { ...input, trainerId: trainer.id }),
    )
    return session.id
  })
}

// ---------------------------------------------------------------------------

export interface TodayView {
  date: string
  timeZone: string
  sessions: SessionView[]
  unscheduled: SessionView[]
}

export async function todayForTrainer(): Promise<TodayView> {
  const trainer = await currentTrainer()
  const { date } = utcToZoned(new Date(), trainer.timeZone)
  const [y, m, d] = date.split('-').map(Number)
  const tomorrow = new Date(Date.UTC(y, m - 1, d + 1))
    .toISOString()
    .slice(0, 10)
  const from = zonedToUtc(date, '00:00', trainer.timeZone)
  const to = zonedToUtc(tomorrow, '00:00', trainer.timeZone)

  const withClient = () =>
    db
      .select({ session: sessions, clientName: clients.fullName })
      .from(sessions)
      .innerJoin(clients, eq(clients.id, sessions.clientId))
  const [today, unscheduled] = await Promise.all([
    withClient()
      .where(
        and(
          eq(sessions.trainerId, trainer.id),
          gte(sessions.scheduledStart, from),
          lt(sessions.scheduledStart, to),
        ),
      )
      .orderBy(asc(sessions.scheduledStart)),
    withClient()
      .where(
        and(
          eq(sessions.trainerId, trainer.id),
          eq(sessions.status, 'unscheduled'),
        ),
      )
      .orderBy(asc(sessions.createdAt)),
  ])
  const view = (row: {
    session: typeof sessions.$inferSelect
    clientName: string
  }) => toSessionView(row.session, { clientName: row.clientName })
  return {
    date,
    timeZone: trainer.timeZone,
    sessions: today.map(view),
    unscheduled: unscheduled.map(view),
  }
}
