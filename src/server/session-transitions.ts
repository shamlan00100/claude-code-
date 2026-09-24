import { randomUUID } from 'node:crypto'

import { eq, sql } from 'drizzle-orm'

import { sessionEvents, sessions } from '#/db/schema'

import type { Tx } from './db-types'
import { RuleError, asRuleError } from './errors'

export type SessionStatus = (typeof sessions.$inferSelect)['status']
export type RestReason = NonNullable<
  (typeof sessions.$inferSelect)['restReason']
>

/** Who is making a change. `system` is the scheduler (e.g. marking missed). */
export type Actor =
  | { role: 'trainer'; userId: string }
  | { role: 'client'; userId: string }
  | { role: 'system' }

type ActorRole = Actor['role']

// The only allowed status changes, and who may make each one. Anything not
// listed is refused. Rescheduling has its own function because it creates
// the replacement session in the same transaction.
const TRANSITIONS: Partial<
  Record<SessionStatus, Partial<Record<SessionStatus, ActorRole[]>>>
> = {
  unscheduled: {
    booked: ['trainer', 'client'],
    cancelled: ['trainer'],
  },
  booked: {
    confirmed: ['client', 'trainer'],
    in_progress: ['trainer', 'client'],
    substituted: ['client', 'trainer'],
    rested: ['client', 'trainer'],
    cancelled: ['trainer'],
    no_show: ['trainer'],
    missed: ['system'],
  },
  confirmed: {
    in_progress: ['trainer', 'client'],
    substituted: ['client', 'trainer'],
    rested: ['client', 'trainer'],
    cancelled: ['trainer'],
    no_show: ['trainer'],
  },
  in_progress: {
    completed: ['trainer', 'client'],
  },
  // A missed commitment can still be renegotiated after the fact.
  missed: {
    substituted: ['client', 'trainer'],
    rested: ['client', 'trainer'],
  },
}

const RESCHEDULABLE: SessionStatus[] = ['booked', 'confirmed', 'missed']

export function canTransition(
  from: SessionStatus,
  to: SessionStatus,
  role: ActorRole,
): boolean {
  return TRANSITIONS[from]?.[to]?.includes(role) ?? false
}

async function lockSession(tx: Tx, sessionId: string) {
  const [row] = await tx
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .for('update')
  if (!(row as typeof row | undefined)) {
    throw new RuleError('session_not_found')
  }
  return row
}

function actorUserId(actor: Actor): string | null {
  return actor.role === 'system' ? null : actor.userId
}

export interface TransitionInput {
  sessionId: string
  to: Exclude<SessionStatus, 'rescheduled' | 'unscheduled'>
  actor: Actor
  reason?: string
  restReason?: RestReason
  data?: Record<string, unknown>
}

/**
 * The one way to change a session's status. Validates the transition for
 * the actor, sets the matching timestamps, and writes the audit row.
 * Must run inside the caller's transaction.
 */
export async function transitionSession(tx: Tx, input: TransitionInput) {
  const current = await lockSession(tx, input.sessionId)
  const { to, actor } = input

  if (!canTransition(current.status, to, actor.role)) {
    throw new RuleError(
      'invalid_transition',
      `${current.status} → ${to} is not allowed for ${actor.role}`,
    )
  }
  // PT attendance is the trainer's call; a client's word alone isn't enough.
  if (to === 'completed' && current.kind === 'pt' && actor.role !== 'trainer') {
    throw new RuleError('trainer_confirms_attendance')
  }
  if (to === 'rested' && !input.restReason) {
    throw new RuleError('rest_reason_required')
  }

  const now = new Date()
  const [updated] = await tx
    .update(sessions)
    .set({
      status: to,
      restReason: to === 'rested' ? input.restReason : null,
      ...(to === 'confirmed' ? { confirmedAt: now } : {}),
      ...(to === 'in_progress' ? { startedAt: now } : {}),
      ...(to === 'completed' ? { completedAt: now } : {}),
    })
    .where(eq(sessions.id, current.id))
    .returning()

  await tx.insert(sessionEvents).values({
    sessionId: current.id,
    fromStatus: current.status,
    toStatus: to,
    actorUserId: actorUserId(actor),
    reason: input.reason,
    data: input.data,
  })

  return updated
}

export interface NewSessionInput {
  clientId: string
  trainerId: string | null
  kind: 'pt' | 'self_directed'
  location: 'gym' | 'home' | 'outdoor' | 'online'
  /** Omit for a session that still needs a time. */
  start?: Date
  durationMinutes: number
  packageId?: string | null
  programDayId?: string | null
  actor: Actor
}

function endOf(start: Date, minutes: number): Date {
  return new Date(start.getTime() + minutes * 60_000)
}

/** Creates a session (booked, or unscheduled without a time) and its first audit row. */
export async function createSession(tx: Tx, input: NewSessionInput) {
  if (input.durationMinutes <= 0) throw new RuleError('invalid_duration')
  const status: SessionStatus = input.start ? 'booked' : 'unscheduled'
  const [created] = await tx
    .insert(sessions)
    .values({
      clientId: input.clientId,
      trainerId: input.trainerId,
      kind: input.kind,
      location: input.location,
      status,
      scheduledStart: input.start ?? null,
      scheduledEnd: input.start
        ? endOf(input.start, input.durationMinutes)
        : null,
      packageId: input.packageId ?? null,
      programDayId: input.programDayId ?? null,
    })
    .returning()
  await tx.insert(sessionEvents).values({
    sessionId: created.id,
    fromStatus: null,
    toStatus: status,
    actorUserId: actorUserId(input.actor),
  })
  return created
}

/**
 * Gives an unscheduled session a time. Same row, so nothing is duplicated.
 */
export async function scheduleSession(
  tx: Tx,
  input: { sessionId: string; start: Date; actor: Actor },
) {
  const current = await lockSession(tx, input.sessionId)
  if (!canTransition(current.status, 'booked', input.actor.role)) {
    throw new RuleError('invalid_transition')
  }
  const minutes = durationOf(current)
  const [updated] = await tx
    .update(sessions)
    .set({
      status: 'booked',
      scheduledStart: input.start,
      scheduledEnd: endOf(input.start, minutes),
    })
    .where(eq(sessions.id, current.id))
    .returning()
  await tx.insert(sessionEvents).values({
    sessionId: current.id,
    fromStatus: current.status,
    toStatus: 'booked',
    actorUserId: actorUserId(input.actor),
  })
  return updated
}

function durationOf(row: typeof sessions.$inferSelect): number {
  if (row.scheduledStart && row.scheduledEnd) {
    return (row.scheduledEnd.getTime() - row.scheduledStart.getTime()) / 60_000
  }
  return 60
}

/**
 * Reschedule: a new session at a specific time replaces the old one, which
 * stays on record as `rescheduled` and points at its replacement. The
 * commitment stays open until the new session happens.
 */
export async function rescheduleSession(
  tx: Tx,
  input: { sessionId: string; start: Date; actor: Actor; reason?: string },
) {
  const current = await lockSession(tx, input.sessionId)
  if (!RESCHEDULABLE.includes(current.status)) {
    throw new RuleError(
      'invalid_transition',
      `${current.status} can't be rescheduled`,
    )
  }
  if (input.actor.role === 'system') throw new RuleError('invalid_transition')

  // The new slot may overlap the old one; the overlap rule is checked once
  // the old slot has been released, at commit.
  await tx.execute(sql`set constraints sessions_no_trainer_overlap deferred`)

  const minutes = durationOf(current)
  const replacementId = randomUUID()
  const [replacement] = await tx
    .insert(sessions)
    .values({
      id: replacementId,
      clientId: current.clientId,
      trainerId: current.trainerId,
      kind: current.kind,
      location: current.location,
      locationNote: current.locationNote,
      status: 'booked',
      scheduledStart: input.start,
      scheduledEnd: endOf(input.start, minutes),
      packageId: current.packageId,
      programDayId: current.programDayId,
      rescheduledFromId: current.id,
    })
    .returning()

  await tx
    .update(sessions)
    .set({ status: 'rescheduled', rescheduledToId: replacementId })
    .where(eq(sessions.id, current.id))

  const who = actorUserId(input.actor)
  await tx.insert(sessionEvents).values([
    {
      sessionId: current.id,
      fromStatus: current.status,
      toStatus: 'rescheduled',
      actorUserId: who,
      reason: input.reason,
      data: { replacementId },
    },
    {
      sessionId: replacementId,
      fromStatus: null,
      toStatus: 'booked',
      actorUserId: who,
      data: { rescheduledFromId: current.id },
    },
  ])

  // Surface an overlap now, as a rule error, rather than at commit.
  try {
    await tx.execute(sql`set constraints sessions_no_trainer_overlap immediate`)
  } catch (error) {
    throw asRuleError(error)
  }
  return replacement
}
