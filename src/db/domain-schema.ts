import { sql } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { locale, user } from './auth-schema'

// Conventions: kilograms, metres and seconds only (convert for display);
// money in minor units (fils); every instant is timestamptz.

const id = () => uuid('id').defaultRandom().primaryKey()
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

/** A trainer's business settings. One row per trainer account. */
export const trainers = pgTable(
  'trainers',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    businessName: text('business_name'),
    timezone: text('timezone').default('Asia/Bahrain').notNull(),
    defaultSessionMinutes: smallint('default_session_minutes')
      .default(60)
      .notNull(),
    defaultCancellationHours: smallint('default_cancellation_hours')
      .default(24)
      .notNull(),
    defaultFreeLateCancels: smallint('default_free_late_cancels')
      .default(1)
      .notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    check('trainers_session_minutes', sql`${t.defaultSessionMinutes} > 0`),
    check(
      'trainers_cancellation_hours',
      sql`${t.defaultCancellationHours} >= 0`,
    ),
    check('trainers_free_late_cancels', sql`${t.defaultFreeLateCancels} >= 0`),
  ],
)

export const sex = pgEnum('sex', ['female', 'male', 'unspecified'])

/**
 * The client as a person. Owned by the client, not by any trainer, so their
 * history survives a change of trainer. `userId` stays null until they accept
 * an invite and have a login.
 */
export const clients = pgTable('clients', {
  id: id(),
  userId: uuid('user_id')
    .unique()
    .references(() => user.id, { onDelete: 'set null' }),
  fullName: text('full_name').notNull(),
  fullNameAr: text('full_name_ar'),
  phone: text('phone'),
  email: text('email'),
  dateOfBirth: date('date_of_birth'),
  sex: sex('sex').default('unspecified').notNull(),
  locale: locale('locale').default('en').notNull(),
  timezone: text('timezone').default('Asia/Bahrain').notNull(),
  createdAt: createdAt(),
})

export const coachingStatus = pgEnum('coaching_status', [
  'invited',
  'active',
  'paused',
  'ended',
])

/**
 * The coaching relationship. Trainer notes about a client live here; the
 * client's own data (sessions, logs, feedback) never keys to this row.
 */
export const trainerClients = pgTable(
  'trainer_clients',
  {
    id: id(),
    trainerId: uuid('trainer_id')
      .notNull()
      .references(() => trainers.userId, { onDelete: 'restrict' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'restrict' }),
    status: coachingStatus('status').default('invited').notNull(),
    goalNote: text('goal_note'),
    injuryNote: text('injury_note'),
    startedAt: timestamp('started_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
  },
  (t) => [
    // At most one open relationship per trainer and client.
    uniqueIndex('trainer_clients_open_unique')
      .on(t.trainerId, t.clientId)
      .where(sql`${t.status} <> 'ended'`),
    index('trainer_clients_client_idx').on(t.clientId),
    check(
      'trainer_clients_ended_at',
      sql`(${t.status} = 'ended') = (${t.endedAt} is not null)`,
    ),
  ],
)

/** Invite links. Only a hash of the token is stored. */
export const clientInvites = pgTable(
  'client_invites',
  {
    id: id(),
    trainerClientId: uuid('trainer_client_id')
      .notNull()
      .references(() => trainerClients.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index('client_invites_trainer_client_idx').on(t.trainerClientId)],
)

// ---------------------------------------------------------------------------
// Exercises and muscles (reference data, imported separately)
// ---------------------------------------------------------------------------

export const bodyRegion = pgEnum('body_region', ['upper', 'core', 'lower'])

export const muscleGroups = pgTable('muscle_groups', {
  id: id(),
  key: text('key').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar'),
  region: bodyRegion('region').notNull(),
  displayOrder: smallint('display_order').default(0).notNull(),
})

/** Decides which fields the logger shows for an exercise. */
export const trackingType = pgEnum('tracking_type', [
  'weight_reps',
  'reps',
  'time',
  'distance_time',
  'time_level',
])

export const exercises = pgTable(
  'exercises',
  {
    id: id(),
    externalId: text('external_id').unique(),
    nameEn: text('name_en').notNull(),
    nameAr: text('name_ar'),
    trackingType: trackingType('tracking_type').notNull(),
    equipment: text('equipment'),
    category: text('category'),
    instructionsEn: text('instructions_en'),
    instructionsAr: text('instructions_ar'),
    createdByTrainerId: uuid('created_by_trainer_id').references(
      () => trainers.userId,
      { onDelete: 'set null' },
    ),
    isCustom: boolean('is_custom').default(false).notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    check(
      'exercises_custom_owner',
      sql`not ${t.isCustom} or ${t.createdByTrainerId} is not null or ${t.archivedAt} is not null`,
    ),
  ],
)

export const muscleRole = pgEnum('muscle_role', ['primary', 'secondary'])

export const exerciseMuscles = pgTable(
  'exercise_muscles',
  {
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    muscleGroupId: uuid('muscle_group_id')
      .notNull()
      .references(() => muscleGroups.id, { onDelete: 'cascade' }),
    role: muscleRole('role').notNull(),
  },
  (t) => [primaryKey({ columns: [t.exerciseId, t.muscleGroupId] })],
)

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

export const programStatus = pgEnum('program_status', [
  'draft',
  'active',
  'completed',
  'archived',
])

/**
 * A template when `clientId` is null. Assigning copies the whole program into
 * a new row with `clientId` set and `sourceProgramId` pointing at the
 * template, so clients never share a live program.
 */
export const programs = pgTable(
  'programs',
  {
    id: id(),
    trainerId: uuid('trainer_id')
      .notNull()
      .references(() => trainers.userId, { onDelete: 'restrict' }),
    clientId: uuid('client_id').references(() => clients.id, {
      onDelete: 'restrict',
    }),
    sourceProgramId: uuid('source_program_id').references(
      (): AnyPgColumn => programs.id,
      { onDelete: 'set null' },
    ),
    nameEn: text('name_en').notNull(),
    nameAr: text('name_ar'),
    notes: text('notes'),
    status: programStatus('status').default('draft').notNull(),
    startsOn: date('starts_on'),
    endsOn: date('ends_on'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // One active program per client.
    uniqueIndex('programs_one_active_per_client')
      .on(t.clientId)
      .where(sql`${t.clientId} is not null and ${t.status} = 'active'`),
    index('programs_trainer_idx').on(t.trainerId),
    check(
      'programs_assigned_has_start',
      sql`${t.clientId} is null or ${t.status} = 'draft' or ${t.startsOn} is not null`,
    ),
    check(
      'programs_template_not_active',
      sql`${t.clientId} is not null or ${t.status} in ('draft', 'archived')`,
    ),
    check(
      'programs_dates',
      sql`${t.endsOn} is null or ${t.startsOn} is null or ${t.endsOn} >= ${t.startsOn}`,
    ),
  ],
)

export const programDays = pgTable(
  'program_days',
  {
    id: id(),
    programId: uuid('program_id')
      .notNull()
      .references(() => programs.id, { onDelete: 'cascade' }),
    orderIndex: smallint('order_index').notNull(),
    name: text('name').notNull(),
    notes: text('notes'),
  },
  (t) => [index('program_days_program_idx').on(t.programId, t.orderIndex)],
)

// Targets shared by program exercises and the session copies made from them.
const targets = () => ({
  targetSets: smallint('target_sets'),
  targetRepsMin: smallint('target_reps_min'),
  targetRepsMax: smallint('target_reps_max'),
  targetWeightKg: numeric('target_weight_kg', { precision: 6, scale: 2 }),
  targetDurationS: integer('target_duration_s'),
  targetDistanceM: numeric('target_distance_m', { precision: 9, scale: 2 }),
  targetLevel: numeric('target_level', { precision: 4, scale: 1 }),
  restS: smallint('rest_s'),
  notes: text('notes'),
})

const targetChecks = (
  t: Record<
    | 'targetSets'
    | 'targetRepsMin'
    | 'targetRepsMax'
    | 'targetWeightKg'
    | 'targetDurationS'
    | 'targetDistanceM'
    | 'restS',
    unknown
  >,
  prefix: string,
) => [
  check(`${prefix}_sets`, sql`${t.targetSets} is null or ${t.targetSets} > 0`),
  check(
    `${prefix}_reps`,
    sql`${t.targetRepsMin} is null or ${t.targetRepsMax} is null or ${t.targetRepsMax} >= ${t.targetRepsMin}`,
  ),
  check(
    `${prefix}_non_negative`,
    sql`coalesce(${t.targetRepsMin}, 0) >= 0 and coalesce(${t.targetWeightKg}, 0) >= 0 and coalesce(${t.targetDurationS}, 0) >= 0 and coalesce(${t.targetDistanceM}, 0) >= 0 and coalesce(${t.restS}, 0) >= 0`,
  ),
]

export const programExercises = pgTable(
  'program_exercises',
  {
    id: id(),
    programDayId: uuid('program_day_id')
      .notNull()
      .references(() => programDays.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    orderIndex: smallint('order_index').notNull(),
    ...targets(),
  },
  (t) => [
    index('program_exercises_day_idx').on(t.programDayId, t.orderIndex),
    ...targetChecks(t, 'program_exercises'),
  ],
)

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

export const packageStructure = pgEnum('package_structure', [
  'session_pack',
  'monthly',
])

export const sessionLocation = pgEnum('session_location', [
  'gym',
  'home',
  'outdoor',
  'online',
])

/** What a trainer sells. Editing a template never changes sold packages. */
export const packageTemplates = pgTable(
  'package_templates',
  {
    id: id(),
    trainerId: uuid('trainer_id')
      .notNull()
      .references(() => trainers.userId, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    structure: packageStructure('structure').notNull(),
    sessions: smallint('sessions').notNull(),
    locations: sessionLocation('locations').array().notNull(),
    validityDays: smallint('validity_days'),
    sessionMinutes: smallint('session_minutes').notNull(),
    cancellationHours: smallint('cancellation_hours').notNull(),
    freeLateCancels: smallint('free_late_cancels').notNull(),
    priceMinor: integer('price_minor').notNull(),
    currency: text('currency').default('BHD').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    check('package_templates_sessions', sql`${t.sessions} > 0`),
    check('package_templates_locations', sql`cardinality(${t.locations}) > 0`),
    check('package_templates_price', sql`${t.priceMinor} >= 0`),
  ],
)

export const packageStatus = pgEnum('package_status', [
  'active',
  'paused',
  'completed',
  'expired',
  'cancelled',
])

/**
 * A package sold to a client. Every rule is copied from the template at sale.
 * `sessions` is the total for a session pack, or the number per month for a
 * monthly plan. Only PT sessions the trainer marks as attended use a credit;
 * the balance is never stored, it is counted from sessions.
 */
export const packages = pgTable(
  'packages',
  {
    id: id(),
    trainerId: uuid('trainer_id')
      .notNull()
      .references(() => trainers.userId, { onDelete: 'restrict' }),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'restrict' }),
    templateId: uuid('template_id').references(() => packageTemplates.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    structure: packageStructure('structure').notNull(),
    sessions: smallint('sessions').notNull(),
    /** Where sessions on this package may happen: home only, gym only, or a mix. */
    locations: sessionLocation('locations').array().notNull(),
    startsOn: date('starts_on').notNull(),
    expiresOn: date('expires_on'),
    sessionMinutes: smallint('session_minutes').notNull(),
    cancellationHours: smallint('cancellation_hours').notNull(),
    freeLateCancels: smallint('free_late_cancels').notNull(),
    priceMinor: integer('price_minor').notNull(),
    currency: text('currency').notNull(),
    status: packageStatus('status').default('active').notNull(),
    pausedAt: timestamp('paused_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index('packages_client_idx').on(t.clientId),
    index('packages_trainer_idx').on(t.trainerId),
    check('packages_price', sql`${t.priceMinor} >= 0`),
    check('packages_sessions', sql`${t.sessions} > 0`),
    check('packages_locations', sql`cardinality(${t.locations}) > 0`),
    check(
      'packages_dates',
      sql`${t.expiresOn} is null or ${t.expiresOn} >= ${t.startsOn}`,
    ),
    check(
      'packages_paused_at',
      sql`(${t.status} = 'paused') = (${t.pausedAt} is not null)`,
    ),
  ],
)

// ---------------------------------------------------------------------------
// Booking
// ---------------------------------------------------------------------------

/** Weekly availability in the trainer's timezone, minutes from midnight. */
export const trainerAvailability = pgTable(
  'trainer_availability',
  {
    id: id(),
    trainerId: uuid('trainer_id')
      .notNull()
      .references(() => trainers.userId, { onDelete: 'cascade' }),
    weekday: smallint('weekday').notNull(),
    startMinute: smallint('start_minute').notNull(),
    endMinute: smallint('end_minute').notNull(),
    location: sessionLocation('location'),
  },
  (t) => [
    index('trainer_availability_trainer_idx').on(t.trainerId, t.weekday),
    // 0 = Sunday, matching JavaScript's Date#getDay.
    check('trainer_availability_weekday', sql`${t.weekday} between 0 and 6`),
    check(
      'trainer_availability_minutes',
      sql`${t.startMinute} >= 0 and ${t.endMinute} <= 1440 and ${t.endMinute} > ${t.startMinute}`,
    ),
  ],
)

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export const sessionKind = pgEnum('session_kind', ['pt', 'self_directed'])

/**
 * unscheduled → booked → confirmed → in_progress → completed is the happy
 * path. rescheduled, substituted and rested are the three renegotiated
 * outcomes; missed means no response at all. Transitions are enforced in
 * src/server/session-transitions.ts, never by updating this column directly.
 */
export const sessionStatus = pgEnum('session_status', [
  'unscheduled',
  'booked',
  'confirmed',
  'in_progress',
  'completed',
  'rescheduled',
  'substituted',
  'rested',
  'cancelled',
  'no_show',
  'missed',
])

export const restReason = pgEnum('rest_reason', [
  'sore',
  'unwell',
  'travelling',
  'no_time',
  'other',
])

export const creditOutcome = pgEnum('credit_outcome', [
  'consumed',
  'returned',
  'waived',
])

export const sessions = pgTable(
  'sessions',
  {
    id: id(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'restrict' }),
    trainerId: uuid('trainer_id').references(() => trainers.userId, {
      onDelete: 'set null',
    }),
    kind: sessionKind('kind').notNull(),
    status: sessionStatus('status').notNull(),
    location: sessionLocation('location').notNull(),
    locationNote: text('location_note'),
    scheduledStart: timestamp('scheduled_start', { withTimezone: true }),
    // Stored rather than computed so the no-double-booking constraint can
    // index the time range.
    scheduledEnd: timestamp('scheduled_end', { withTimezone: true }),
    packageId: uuid('package_id').references(() => packages.id, {
      onDelete: 'restrict',
    }),
    programDayId: uuid('program_day_id').references(() => programDays.id, {
      onDelete: 'set null',
    }),
    rescheduledFromId: uuid('rescheduled_from_id').references(
      (): AnyPgColumn => sessions.id,
      { onDelete: 'set null' },
    ),
    rescheduledToId: uuid('rescheduled_to_id').references(
      (): AnyPgColumn => sessions.id,
      { onDelete: 'set null' },
    ),
    restReason: restReason('rest_reason'),
    creditOutcome: creditOutcome('credit_outcome'),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    trainerNote: text('trainer_note'),
    clientNote: text('client_note'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('sessions_client_start_idx').on(t.clientId, t.scheduledStart),
    index('sessions_trainer_start_idx').on(t.trainerId, t.scheduledStart),
    index('sessions_package_idx').on(t.packageId),
    check(
      'sessions_time_set',
      sql`(${t.scheduledStart} is null) = (${t.scheduledEnd} is null) and (${t.scheduledEnd} is null or ${t.scheduledEnd} > ${t.scheduledStart})`,
    ),
    check(
      'sessions_unscheduled_has_no_time',
      sql`(${t.status} = 'unscheduled') = (${t.scheduledStart} is null)`,
    ),
    check(
      'sessions_pt_has_trainer',
      sql`${t.kind} <> 'pt' or ${t.trainerId} is not null`,
    ),
    check(
      'sessions_rested_has_reason',
      sql`(${t.status} = 'rested') = (${t.restReason} is not null)`,
    ),
    check(
      'sessions_rescheduled_has_target',
      sql`(${t.status} = 'rescheduled') = (${t.rescheduledToId} is not null)`,
    ),
    check(
      'sessions_package_is_pt',
      sql`${t.packageId} is null or ${t.kind} = 'pt'`,
    ),
    // The no-double-booking exclusion constraint is added in SQL in the
    // migration: Drizzle cannot express it.
  ],
)

/** Audit trail: one row for every status change, written in the same transaction. */
export const sessionEvents = pgTable(
  'session_events',
  {
    id: id(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    fromStatus: sessionStatus('from_status'),
    toStatus: sessionStatus('to_status').notNull(),
    actorUserId: uuid('actor_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    reason: text('reason'),
    data: jsonb('data'),
    createdAt: createdAt(),
  },
  (t) => [index('session_events_session_idx').on(t.sessionId, t.createdAt)],
)

export const intensity = pgEnum('intensity', ['light', 'moderate', 'hard'])

/** What the client did instead of a session. */
export const sessionSubstitutions = pgTable(
  'session_substitutions',
  {
    sessionId: uuid('session_id')
      .primaryKey()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    activity: text('activity').notNull(),
    durationS: integer('duration_s'),
    distanceM: numeric('distance_m', { precision: 9, scale: 2 }),
    intensity: intensity('intensity'),
    note: text('note'),
    loggedAt: createdAt(),
  },
  (t) => [
    check(
      'session_substitutions_non_negative',
      sql`coalesce(${t.durationS}, 0) >= 0 and coalesce(${t.distanceM}, 0) >= 0`,
    ),
  ],
)

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

/** Copied from the program when the session starts, then editable. */
export const sessionExercises = pgTable(
  'session_exercises',
  {
    id: id(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    orderIndex: smallint('order_index').notNull(),
    fromProgramExerciseId: uuid('from_program_exercise_id').references(
      () => programExercises.id,
      { onDelete: 'set null' },
    ),
    addedLive: boolean('added_live').default(false).notNull(),
    ...targets(),
  },
  (t) => [
    index('session_exercises_session_idx').on(t.sessionId, t.orderIndex),
    index('session_exercises_exercise_idx').on(t.exerciseId),
    ...targetChecks(t, 'session_exercises'),
  ],
)

export const setLogs = pgTable(
  'set_logs',
  {
    id: id(),
    sessionExerciseId: uuid('session_exercise_id')
      .notNull()
      .references(() => sessionExercises.id, { onDelete: 'cascade' }),
    setIndex: smallint('set_index').notNull(),
    weightKg: numeric('weight_kg', { precision: 6, scale: 2 }),
    reps: smallint('reps'),
    durationS: integer('duration_s'),
    distanceM: numeric('distance_m', { precision: 9, scale: 2 }),
    level: numeric('level', { precision: 4, scale: 1 }),
    rpe: numeric('rpe', { precision: 3, scale: 1 }),
    isWarmup: boolean('is_warmup').default(false).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('set_logs_order').on(t.sessionExerciseId, t.setIndex),
    check(
      'set_logs_non_negative',
      sql`coalesce(${t.weightKg}, 0) >= 0 and coalesce(${t.reps}, 0) >= 0 and coalesce(${t.durationS}, 0) >= 0 and coalesce(${t.distanceM}, 0) >= 0 and coalesce(${t.level}, 0) >= 0`,
    ),
    check('set_logs_rpe', sql`${t.rpe} is null or ${t.rpe} between 1 and 10`),
  ],
)

// ---------------------------------------------------------------------------
// End-of-session body map
// ---------------------------------------------------------------------------

export const sessionFeedback = pgTable('session_feedback', {
  sessionId: uuid('session_id')
    .primaryKey()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  overall: intensity('overall'),
  note: text('note'),
  submittedAt: createdAt(),
})

/** Where the client felt the session. Pain is flagged separately. */
export const sessionFeedbackAreas = pgTable(
  'session_feedback_areas',
  {
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessionFeedback.sessionId, { onDelete: 'cascade' }),
    muscleGroupId: uuid('muscle_group_id')
      .notNull()
      .references(() => muscleGroups.id, { onDelete: 'restrict' }),
    intensity: intensity('intensity').notNull(),
    isPain: boolean('is_pain').default(false).notNull(),
  },
  (t) => [primaryKey({ columns: [t.sessionId, t.muscleGroupId] })],
)
