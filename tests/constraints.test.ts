import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '#/db'
import {
  packageAllowances,
  packages,
  sessionExercises,
  sessions,
  setLogs,
  trainerClients,
} from '#/db/schema'

import {
  makeClient,
  makeExercise,
  makeTrainer,
  resetDatabase,
  violation,
} from './helpers'

let trainerId: string
let clientId: string

beforeEach(async () => {
  await resetDatabase()
  trainerId = await makeTrainer()
  clientId = await makeClient(trainerId)
})

const base = () => ({
  clientId,
  trainerId,
  kind: 'pt' as const,
  location: 'gym' as const,
})

describe('database rules', () => {
  it('keeps session time and status consistent', async () => {
    expect(
      await violation(() =>
        db.insert(sessions).values({ ...base(), status: 'booked' }),
      ),
    ).toBe('sessions_unscheduled_has_no_time')
    expect(
      await violation(() =>
        db.insert(sessions).values({
          ...base(),
          status: 'booked',
          scheduledStart: new Date('2026-10-04T07:00:00Z'),
          scheduledEnd: new Date('2026-10-04T06:00:00Z'),
        }),
      ),
    ).toBe('sessions_time_set')
  })

  it('requires a trainer for PT and a reason to rest', async () => {
    expect(
      await violation(() =>
        db.insert(sessions).values({
          ...base(),
          trainerId: null,
          status: 'unscheduled',
        }),
      ),
    ).toBe('sessions_pt_has_trainer')
    expect(
      await violation(() =>
        db.insert(sessions).values({
          ...base(),
          status: 'rested',
          scheduledStart: new Date('2026-10-04T06:00:00Z'),
          scheduledEnd: new Date('2026-10-04T07:00:00Z'),
        }),
      ),
    ).toBe('sessions_rested_has_reason')
  })

  it('allows one open coaching relationship per trainer and client', async () => {
    expect(
      await violation(() =>
        db.insert(trainerClients).values({ trainerId, clientId }),
      ),
    ).toBe('trainer_clients_open_unique')
  })

  it('rejects empty package allowances and negative prices', async () => {
    const [pack] = await db
      .insert(packages)
      .values({
        trainerId,
        clientId,
        name: '10 sessions',
        structure: 'session_pack',
        startsOn: '2026-10-01',
        sessionMinutes: 60,
        cancellationHours: 24,
        freeLateCancels: 1,
        priceMinor: 250_000,
        currency: 'BHD',
      })
      .returning()
    expect(
      await violation(() =>
        db
          .insert(packageAllowances)
          .values({ packageId: pack.id, location: 'gym', sessions: 0 }),
      ),
    ).toBe('package_allowances_positive')
    expect(
      await violation(() =>
        db.insert(packages).values({
          trainerId,
          clientId,
          name: 'Bad',
          structure: 'monthly',
          startsOn: '2026-10-01',
          sessionMinutes: 60,
          cancellationHours: 24,
          freeLateCancels: 1,
          priceMinor: -1,
          currency: 'BHD',
        }),
      ),
    ).toBe('packages_price')
  })

  it('logs time and distance as well as weight and reps', async () => {
    const [session] = await db
      .insert(sessions)
      .values({ ...base(), kind: 'self_directed', status: 'unscheduled' })
      .returning()
    const run = await makeExercise('distance_time')
    const [entry] = await db
      .insert(sessionExercises)
      .values({ sessionId: session.id, exerciseId: run, orderIndex: 0 })
      .returning()
    const [set] = await db
      .insert(setLogs)
      .values({
        sessionExerciseId: entry.id,
        setIndex: 0,
        distanceM: '5000',
        durationS: 1680,
      })
      .returning()
    expect(set.distanceM).toBe('5000.00')
    expect(
      await violation(() =>
        db
          .insert(setLogs)
          .values({ sessionExerciseId: entry.id, setIndex: 1, rpe: '11' }),
      ),
    ).toBe('set_logs_rpe')
  })
})
