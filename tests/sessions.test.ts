import { asc, eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '#/db'
import { sessionEvents, sessions } from '#/db/schema'
import { RuleError } from '#/server/errors'
import {
  createSession,
  rescheduleSession,
  scheduleSession,
  transitionSession,
} from '#/server/session-transitions'
import type { Actor } from '#/server/session-transitions'

import {
  makeClient,
  makeClientUser,
  makeTrainer,
  resetDatabase,
  violation,
} from './helpers'

const at = (iso: string) => new Date(iso)

let trainerId: string
let clientId: string
let trainer: Actor
let client: Actor
const system: Actor = { role: 'system' }

beforeEach(async () => {
  await resetDatabase()
  trainerId = await makeTrainer()
  clientId = await makeClient(trainerId)
  trainer = { role: 'trainer', userId: trainerId }
  client = { role: 'client', userId: await makeClientUser() }
})

function book(start: string, kind: 'pt' | 'self_directed' = 'pt') {
  return db.transaction((tx) =>
    createSession(tx, {
      clientId,
      trainerId,
      kind,
      location: 'gym',
      start: at(start),
      durationMinutes: 60,
      actor: trainer,
    }),
  )
}

function move(
  sessionId: string,
  to: Parameters<typeof transitionSession>[1]['to'],
  actor: Actor,
  extra = {},
) {
  return db.transaction((tx) =>
    transitionSession(tx, { sessionId, to, actor, ...extra }),
  )
}

async function history(sessionId: string) {
  const rows = await db
    .select()
    .from(sessionEvents)
    .where(eq(sessionEvents.sessionId, sessionId))
    .orderBy(asc(sessionEvents.createdAt))
  return rows.map((row) => `${row.fromStatus ?? '∅'}→${row.toStatus}`)
}

describe('session state machine', () => {
  it('runs the happy path and records every change', async () => {
    const session = await book('2026-10-04T06:00:00Z')
    await move(session.id, 'confirmed', client)
    await move(session.id, 'in_progress', trainer)
    const done = await move(session.id, 'completed', trainer)

    expect(done.status).toBe('completed')
    expect(done.confirmedAt).not.toBeNull()
    expect(done.completedAt).not.toBeNull()
    expect(await history(session.id)).toEqual([
      '∅→booked',
      'booked→confirmed',
      'confirmed→in_progress',
      'in_progress→completed',
    ])
  })

  it('refuses transitions that are not allowed', async () => {
    const session = await book('2026-10-04T06:00:00Z')
    await expect(move(session.id, 'completed', trainer)).rejects.toThrow(
      RuleError,
    )
    // Only the scheduler marks a session missed.
    await expect(move(session.id, 'missed', trainer)).rejects.toThrow(RuleError)
    // Clients can't cancel on the trainer's behalf.
    await expect(move(session.id, 'cancelled', client)).rejects.toThrow(
      RuleError,
    )
    // Nothing leaves a finished state.
    await move(session.id, 'cancelled', trainer)
    await expect(move(session.id, 'confirmed', client)).rejects.toThrow(
      RuleError,
    )
    expect(await history(session.id)).toEqual(['∅→booked', 'booked→cancelled'])
  })

  it('only lets the trainer confirm attendance for a PT session', async () => {
    const pt = await book('2026-10-04T06:00:00Z')
    await move(pt.id, 'in_progress', client)
    await expect(move(pt.id, 'completed', client)).rejects.toThrow(
      'trainer_confirms_attendance',
    )

    const own = await book('2026-10-05T06:00:00Z', 'self_directed')
    await move(own.id, 'in_progress', client)
    expect((await move(own.id, 'completed', client)).status).toBe('completed')
  })

  it('requires a reason to rest', async () => {
    const session = await book('2026-10-04T06:00:00Z')
    await expect(move(session.id, 'rested', client)).rejects.toThrow(
      'rest_reason_required',
    )
    const rested = await move(session.id, 'rested', client, {
      restReason: 'sore',
    })
    expect(rested.restReason).toBe('sore')
  })

  it('lets a missed session still be renegotiated', async () => {
    const session = await book('2026-10-04T06:00:00Z')
    await move(session.id, 'missed', system)
    const rested = await move(session.id, 'rested', client, {
      restReason: 'unwell',
    })
    expect(rested.status).toBe('rested')
  })

  it('gives an unscheduled session a time without a second row', async () => {
    const pending = await db.transaction((tx) =>
      createSession(tx, {
        clientId,
        trainerId,
        kind: 'pt',
        location: 'gym',
        durationMinutes: 45,
        actor: trainer,
      }),
    )
    expect(pending.status).toBe('unscheduled')
    const booked = await db.transaction((tx) =>
      scheduleSession(tx, {
        sessionId: pending.id,
        start: at('2026-10-06T15:00:00Z'),
        actor: trainer,
      }),
    )
    expect(booked.id).toBe(pending.id)
    expect(booked.status).toBe('booked')
    expect(await db.$count(sessions)).toBe(1)
  })
})

describe('rescheduling', () => {
  it('replaces the session and keeps the old one on record', async () => {
    const original = await book('2026-10-04T06:00:00Z')
    const replacement = await db.transaction((tx) =>
      rescheduleSession(tx, {
        sessionId: original.id,
        start: at('2026-10-05T17:00:00Z'),
        actor: client,
      }),
    )
    const old = await db.query.sessions.findFirst({
      where: eq(sessions.id, original.id),
    })
    expect(old?.status).toBe('rescheduled')
    expect(old?.rescheduledToId).toBe(replacement.id)
    expect(replacement.rescheduledFromId).toBe(original.id)
    expect(replacement.status).toBe('booked')
    expect(
      replacement.scheduledEnd!.getTime() -
        replacement.scheduledStart!.getTime(),
    ).toBe(60 * 60_000)
  })

  it('can move a session by 30 minutes into its own old slot', async () => {
    const original = await book('2026-10-04T06:00:00Z')
    const replacement = await db.transaction((tx) =>
      rescheduleSession(tx, {
        sessionId: original.id,
        start: at('2026-10-04T06:30:00Z'),
        actor: trainer,
      }),
    )
    expect(replacement.status).toBe('booked')
  })

  it('refuses a new time that clashes with another booking', async () => {
    const original = await book('2026-10-04T06:00:00Z')
    await book('2026-10-05T17:00:00Z')
    await expect(
      db.transaction((tx) =>
        rescheduleSession(tx, {
          sessionId: original.id,
          start: at('2026-10-05T17:30:00Z'),
          actor: client,
        }),
      ),
    ).rejects.toThrow('trainer_busy')
    // Nothing changed: the transaction rolled back.
    const old = await db.query.sessions.findFirst({
      where: eq(sessions.id, original.id),
    })
    expect(old?.status).toBe('booked')
    expect(await db.$count(sessions)).toBe(2)
  })
})

describe('no double-booking', () => {
  it('rejects overlapping PT sessions for the same trainer', async () => {
    await book('2026-10-04T06:00:00Z')
    expect(await violation(() => book('2026-10-04T06:30:00Z'))).toBe(
      'sessions_no_trainer_overlap',
    )
  })

  it('allows back-to-back sessions', async () => {
    await book('2026-10-04T06:00:00Z')
    await expect(book('2026-10-04T07:00:00Z')).resolves.toBeTruthy()
  })

  it('frees the slot once a session is cancelled', async () => {
    const first = await book('2026-10-04T06:00:00Z')
    await move(first.id, 'cancelled', trainer)
    await expect(book('2026-10-04T06:00:00Z')).resolves.toBeTruthy()
  })

  it('ignores self-directed sessions', async () => {
    await book('2026-10-04T06:00:00Z')
    await expect(
      book('2026-10-04T06:00:00Z', 'self_directed'),
    ).resolves.toBeTruthy()
  })
})
