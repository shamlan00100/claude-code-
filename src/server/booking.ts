import { and, asc, eq, isNull, or, gte } from 'drizzle-orm'

import { packages, trainers } from '#/db/schema'
import { zonedToUtc } from '#/lib/time'

import { assertCoaches } from './access'
import type { Tx } from './db-types'
import { RuleError, asRuleError } from './errors'
import { assertPackageFits } from './packages'
import { createSession } from './session-transitions'

type Location = (typeof packages.$inferSelect)['locations'][number]

export interface BookInput {
  trainerId: string
  clientId: string
  location: Location
  /** Wall-clock date and time in the trainer's timezone. Omit both to save without a time. */
  date?: string
  time?: string
  durationMinutes?: number
  /** A specific package, `null` for pay-as-you-go, or omit to pick one. */
  packageId?: string | null
}

/**
 * Books a PT session for a client the trainer coaches. When no package is
 * named, the active package that allows this location and expires soonest
 * pays for it; with none, the session is pay-as-you-go.
 */
export async function bookPtSession(tx: Tx, input: BookInput) {
  await assertCoaches(tx, input.trainerId, input.clientId)
  const settings = await tx.query.trainers.findFirst({
    where: eq(trainers.userId, input.trainerId),
  })
  if (!settings) throw new RuleError('trainer_not_found')
  if (Boolean(input.date) !== Boolean(input.time)) {
    throw new RuleError('date_and_time_together')
  }
  const date = input.date ?? new Date().toISOString().slice(0, 10)

  let pkg: typeof packages.$inferSelect | undefined
  if (input.packageId) {
    pkg = await tx.query.packages.findFirst({
      where: eq(packages.id, input.packageId),
    })
    if (!pkg) throw new RuleError('package_not_found')
    assertPackageFits(pkg, { ...input, date })
  } else if (input.packageId === undefined) {
    const candidates = await tx.query.packages.findMany({
      where: and(
        eq(packages.trainerId, input.trainerId),
        eq(packages.clientId, input.clientId),
        eq(packages.status, 'active'),
        or(isNull(packages.expiresOn), gte(packages.expiresOn, date)),
      ),
      orderBy: [asc(packages.expiresOn), asc(packages.createdAt)],
    })
    pkg = candidates.find(
      (candidate) =>
        candidate.startsOn <= date &&
        candidate.locations.includes(input.location),
    )
  }

  const start =
    input.date && input.time
      ? zonedToUtc(input.date, input.time, settings.timezone)
      : undefined
  try {
    return await createSession(tx, {
      clientId: input.clientId,
      trainerId: input.trainerId,
      kind: 'pt',
      location: input.location,
      start,
      durationMinutes:
        input.durationMinutes ??
        pkg?.sessionMinutes ??
        settings.defaultSessionMinutes,
      packageId: pkg?.id ?? null,
      actor: { role: 'trainer', userId: input.trainerId },
    })
  } catch (error) {
    throw asRuleError(error)
  }
}
