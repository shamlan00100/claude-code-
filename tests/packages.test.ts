import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '#/db'
import { packages, sessions } from '#/db/schema'
import { zonedToUtc } from '#/lib/time'
import { bookPtSession } from '#/server/booking'
import { ForbiddenError } from '#/server/errors'
import { monthlyPeriod, packageBalance, sellPackage } from '#/server/packages'
import type { SellPackageInput } from '#/server/packages'
import { createSession, transitionSession } from '#/server/session-transitions'

import { makeClient, makeTrainer, resetDatabase } from './helpers'

const TZ = 'Asia/Bahrain'
let trainerId: string
let clientId: string

beforeEach(async () => {
  await resetDatabase()
  trainerId = await makeTrainer()
  clientId = await makeClient(trainerId)
})

function sell(input: Partial<SellPackageInput> = {}) {
  return db.transaction((tx) =>
    sellPackage(tx, {
      trainerId,
      clientId,
      name: '10 sessions',
      structure: 'session_pack',
      sessions: 10,
      locations: ['gym'],
      startsOn: '2026-10-01',
      expiresOn: null,
      priceMinor: 250_000,
      ...input,
    }),
  )
}

function book(
  date: string,
  time: string,
  location: 'gym' | 'home' | 'outdoor' | 'online' = 'gym',
  extra: { packageId?: string | null } = {},
) {
  return db.transaction((tx) =>
    bookPtSession(tx, { trainerId, clientId, location, date, time, ...extra }),
  )
}

const trainer = () => ({ role: 'trainer' as const, userId: trainerId })

async function attend(sessionId: string) {
  await db.transaction(async (tx) => {
    await transitionSession(tx, {
      sessionId,
      to: 'in_progress',
      actor: trainer(),
    })
    await transitionSession(tx, {
      sessionId,
      to: 'completed',
      actor: trainer(),
    })
  })
}

async function balanceOf(packageId: string, onDate?: string) {
  const pkg = await db.query.packages.findFirst({
    where: eq(packages.id, packageId),
  })
  return packageBalance(db, pkg!, TZ, onDate)
}

describe('package balance', () => {
  it('counts only PT sessions the trainer marked as attended', async () => {
    const pack = await sell()
    const attended = await book('2026-10-04', '06:00')
    const noShow = await book('2026-10-05', '06:00')
    const cancelled = await book('2026-10-06', '06:00')
    await book('2026-10-07', '06:00')

    await attend(attended.id)
    await db.transaction(async (tx) => {
      await transitionSession(tx, {
        sessionId: noShow.id,
        to: 'no_show',
        actor: trainer(),
      })
      await transitionSession(tx, {
        sessionId: cancelled.id,
        to: 'cancelled',
        actor: trainer(),
      })
    })

    expect(await balanceOf(pack.id)).toMatchObject({
      included: 10,
      used: 1,
      upcoming: 1,
      remaining: 9,
    })
  })

  it('counts a session the trainer explicitly marks as used', async () => {
    const pack = await sell()
    const late = await book('2026-10-04', '06:00')
    await db.transaction((tx) =>
      transitionSession(tx, {
        sessionId: late.id,
        to: 'cancelled',
        actor: trainer(),
      }),
    )
    await db
      .update(sessions)
      .set({ creditOutcome: 'consumed' })
      .where(eq(sessions.id, late.id))
    expect((await balanceOf(pack.id)).used).toBe(1)
  })

  it('never counts solo workouts', async () => {
    const pack = await sell()
    const solo = await db.transaction((tx) =>
      createSession(tx, {
        clientId,
        trainerId,
        kind: 'self_directed',
        location: 'gym',
        start: zonedToUtc('2026-10-04', '06:00', TZ),
        durationMinutes: 45,
        actor: trainer(),
      }),
    )
    expect(solo.packageId).toBeNull()
    expect((await balanceOf(pack.id)).used).toBe(0)
  })

  it('resets each month for a monthly plan', async () => {
    const monthly = await sell({
      name: '8 a month',
      structure: 'monthly',
      sessions: 8,
      startsOn: '2026-10-15',
    })
    await attend((await book('2026-10-20', '06:00')).id)
    await attend((await book('2026-11-10', '06:00')).id)
    await attend((await book('2026-11-16', '06:00')).id)

    expect(await balanceOf(monthly.id, '2026-10-30')).toMatchObject({
      used: 2,
      remaining: 6,
      period: { from: '2026-10-15', to: '2026-11-15' },
    })
    expect(await balanceOf(monthly.id, '2026-11-20')).toMatchObject({
      used: 1,
      period: { from: '2026-11-15', to: '2026-12-15' },
    })
  })

  it('works out monthly periods, including short months', () => {
    expect(monthlyPeriod('2026-01-31', '2026-02-10')).toEqual({
      from: '2026-01-31',
      to: '2026-02-28',
    })
    expect(monthlyPeriod('2026-01-31', '2026-03-01')).toEqual({
      from: '2026-02-28',
      to: '2026-03-31',
    })
  })

  it('copies rules at sale, so later default changes never alter it', async () => {
    const pack = await sell()
    expect(pack).toMatchObject({
      sessionMinutes: 60,
      cancellationHours: 24,
      freeLateCancels: 1,
      currency: 'BHD',
    })
  })
})

describe('booking a PT session', () => {
  it('stores Bahrain wall-clock time as the right instant', async () => {
    const session = await book('2026-10-04', '06:00')
    expect(session.scheduledStart?.toISOString()).toBe(
      '2026-10-04T03:00:00.000Z',
    )
    expect(session.scheduledEnd?.toISOString()).toBe('2026-10-04T04:00:00.000Z')
  })

  it('charges the package that allows the location', async () => {
    const gym = await sell({ name: 'Gym pack', locations: ['gym'] })
    const home = await sell({ name: 'Home pack', locations: ['home'] })
    expect((await book('2026-10-04', '06:00', 'gym')).packageId).toBe(gym.id)
    expect((await book('2026-10-05', '06:00', 'home')).packageId).toBe(home.id)
  })

  it('allows a mixed package at any of its locations', async () => {
    const mixed = await sell({ locations: ['gym', 'home'] })
    expect((await book('2026-10-04', '06:00', 'home')).packageId).toBe(mixed.id)
    // Outdoor isn't part of it: pay-as-you-go instead.
    expect((await book('2026-10-05', '06:00', 'outdoor')).packageId).toBeNull()
  })

  it('refuses a named package at a location it does not include', async () => {
    const gym = await sell({ locations: ['gym'] })
    await expect(
      book('2026-10-04', '06:00', 'home', { packageId: gym.id }),
    ).rejects.toThrow('package_location_not_included')
  })

  it('skips packages that have expired or not started', async () => {
    await sell({ startsOn: '2026-09-01', expiresOn: '2026-09-30' })
    await sell({ startsOn: '2026-11-01' })
    expect((await book('2026-10-04', '06:00')).packageId).toBeNull()
  })

  it('reports a double-booking as trainer_busy', async () => {
    await book('2026-10-04', '06:00')
    await expect(book('2026-10-04', '06:30')).rejects.toThrow('trainer_busy')
  })

  it("refuses to book a client the trainer doesn't coach", async () => {
    const stranger = await makeClient(await makeTrainer())
    await expect(
      db.transaction((tx) =>
        bookPtSession(tx, {
          trainerId,
          clientId: stranger,
          location: 'gym',
          date: '2026-10-04',
          time: '06:00',
        }),
      ),
    ).rejects.toThrow(ForbiddenError)
  })

  it('saves a session without a time', async () => {
    const pending = await db.transaction((tx) =>
      bookPtSession(tx, { trainerId, clientId, location: 'gym' }),
    )
    expect(pending.status).toBe('unscheduled')
  })
})
