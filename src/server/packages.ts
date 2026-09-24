import { and, count, eq, gte, inArray, lt, or } from 'drizzle-orm'

import { packages, sessions, trainers } from '#/db/schema'
import { addMonths, utcToZoned, zonedToUtc } from '#/lib/time'

import type { DbOrTx, Tx } from './db-types'
import { RuleError } from './errors'

type Package = typeof packages.$inferSelect
type Location = Package['locations'][number]

export interface Balance {
  /** Sessions included: the total for a pack, this month's for a monthly plan. */
  included: number
  /** Attended PT sessions (and any the trainer counted as used). */
  used: number
  /** Booked but not yet happened. */
  upcoming: number
  remaining: number
  /** For monthly plans, the period counted: [from, to). */
  period?: { from: string; to: string }
}

// A credit is used only when the trainer confirms the PT session happened,
// or explicitly counts it (e.g. a late cancellation, decided later).
const usesCredit = or(
  eq(sessions.status, 'completed'),
  eq(sessions.creditOutcome, 'consumed'),
)
const holdsCredit = inArray(sessions.status, [
  'booked',
  'confirmed',
  'in_progress',
])

/** The monthly period containing `date`, anchored on the package start day. */
export function monthlyPeriod(
  startsOn: string,
  date: string,
): { from: string; to: string } {
  let n = 0
  while (addMonths(startsOn, n + 1) <= date) n++
  return { from: addMonths(startsOn, n), to: addMonths(startsOn, n + 1) }
}

/**
 * Counts a package's balance from its sessions. Never stored.
 * `onDate` picks the month for monthly plans (defaults to today).
 */
export async function packageBalance(
  db: DbOrTx,
  pkg: Package,
  timeZone: string,
  onDate?: string,
): Promise<Balance> {
  const filters = [eq(sessions.packageId, pkg.id)]
  let period: Balance['period']
  if (pkg.structure === 'monthly') {
    const today = onDate ?? utcToZoned(new Date(), timeZone).date
    period = monthlyPeriod(pkg.startsOn, today)
    filters.push(
      gte(sessions.scheduledStart, zonedToUtc(period.from, '00:00', timeZone)),
      lt(sessions.scheduledStart, zonedToUtc(period.to, '00:00', timeZone)),
    )
  }
  const [[used], [upcoming]] = await Promise.all([
    db
      .select({ n: count() })
      .from(sessions)
      .where(and(...filters, usesCredit)),
    db
      .select({ n: count() })
      .from(sessions)
      .where(and(...filters, holdsCredit)),
  ])
  return {
    included: pkg.sessions,
    used: used.n,
    upcoming: upcoming.n,
    remaining: Math.max(0, pkg.sessions - used.n),
    period,
  }
}

/**
 * Checks a package can pay for a PT session at this location and date:
 * same trainer and client, active, in date, location allowed.
 */
export function assertPackageFits(
  pkg: Package,
  input: {
    trainerId: string
    clientId: string
    location: Location
    date: string
  },
): void {
  if (pkg.trainerId !== input.trainerId || pkg.clientId !== input.clientId) {
    throw new RuleError('package_mismatch')
  }
  if (pkg.status !== 'active') throw new RuleError('package_not_active')
  if (input.date < pkg.startsOn) throw new RuleError('package_not_started')
  if (pkg.expiresOn && input.date > pkg.expiresOn) {
    throw new RuleError('package_expired')
  }
  if (!pkg.locations.includes(input.location)) {
    throw new RuleError('package_location_not_included')
  }
}

export interface SellPackageInput {
  trainerId: string
  clientId: string
  name: string
  structure: Package['structure']
  sessions: number
  locations: Location[]
  startsOn: string
  expiresOn: string | null
  priceMinor: number
  sessionMinutes?: number
  cancellationHours?: number
  freeLateCancels?: number
}

/**
 * Sells a package. Rules not given are copied from the trainer's defaults
 * now, so later changes to those defaults never alter this package.
 * The caller must already have checked that the trainer coaches the client.
 */
export async function sellPackage(tx: Tx, input: SellPackageInput) {
  const settings = await tx.query.trainers.findFirst({
    where: eq(trainers.userId, input.trainerId),
  })
  if (!settings) throw new RuleError('trainer_not_found')
  const locations = [...new Set(input.locations)]
  if (locations.length === 0) throw new RuleError('package_needs_location')

  const [sold] = await tx
    .insert(packages)
    .values({
      trainerId: input.trainerId,
      clientId: input.clientId,
      name: input.name,
      structure: input.structure,
      sessions: input.sessions,
      locations,
      startsOn: input.startsOn,
      expiresOn: input.expiresOn,
      priceMinor: input.priceMinor,
      currency: 'BHD',
      sessionMinutes: input.sessionMinutes ?? settings.defaultSessionMinutes,
      cancellationHours:
        input.cancellationHours ?? settings.defaultCancellationHours,
      freeLateCancels: input.freeLateCancels ?? settings.defaultFreeLateCancels,
    })
    .returning()
  return sold
}
