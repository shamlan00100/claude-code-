import { asc, eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '#/db'
import { programDays, programExercises, programs } from '#/db/schema'
import { ForbiddenError, RuleError } from '#/server/errors'
import { assignProgram } from '#/server/programs'

import {
  makeClient,
  makeExercise,
  makeTrainer,
  resetDatabase,
  violation,
} from './helpers'

let trainerId: string
let templateId: string
let squat: string
let run: string

beforeEach(async () => {
  await resetDatabase()
  trainerId = await makeTrainer()
  squat = await makeExercise('weight_reps')
  run = await makeExercise('distance_time')

  const [template] = await db
    .insert(programs)
    .values({ trainerId, nameEn: 'Strength base' })
    .returning()
  templateId = template.id
  const [dayA, dayB] = await db
    .insert(programDays)
    .values([
      { programId: templateId, orderIndex: 0, name: 'Lower' },
      { programId: templateId, orderIndex: 1, name: 'Conditioning' },
    ])
    .returning()
  await db.insert(programExercises).values([
    {
      programDayId: dayA.id,
      exerciseId: squat,
      orderIndex: 0,
      targetSets: 3,
      targetRepsMin: 5,
      targetRepsMax: 8,
      targetWeightKg: '60',
    },
    {
      programDayId: dayB.id,
      exerciseId: run,
      orderIndex: 0,
      targetDistanceM: '5000',
      targetDurationS: 1800,
    },
  ])
})

function assign(clientId: string, startsOn = '2026-10-04') {
  return db.transaction((tx) =>
    assignProgram(tx, { trainerId, templateId, clientId, startsOn }),
  )
}

async function exercisesOf(programId: string) {
  return db
    .select({
      day: programDays.name,
      order: programDays.orderIndex,
      exerciseId: programExercises.exerciseId,
      targetWeightKg: programExercises.targetWeightKg,
      targetDistanceM: programExercises.targetDistanceM,
      targetDurationS: programExercises.targetDurationS,
    })
    .from(programExercises)
    .innerJoin(programDays, eq(programDays.id, programExercises.programDayId))
    .where(eq(programDays.programId, programId))
    .orderBy(asc(programDays.orderIndex), asc(programExercises.orderIndex))
}

describe('assigning a program', () => {
  it('copies the template for each client, keeping order and targets', async () => {
    const alice = await makeClient(trainerId)
    const copyId = await assign(alice)

    expect(copyId).not.toBe(templateId)
    const copy = await db.query.programs.findFirst({
      where: eq(programs.id, copyId),
    })
    expect(copy?.clientId).toBe(alice)
    expect(copy?.sourceProgramId).toBe(templateId)
    expect(copy?.status).toBe('active')
    expect(await exercisesOf(copyId)).toEqual(await exercisesOf(templateId))
  })

  it("keeps each client's copy independent of the template and of each other", async () => {
    const alice = await makeClient(trainerId)
    const bob = await makeClient(trainerId)
    const aliceCopy = await assign(alice)
    const bobCopy = await assign(bob)
    const templateBefore = await exercisesOf(templateId)
    const bobBefore = await exercisesOf(bobCopy)

    const [aliceDay] = await db
      .select()
      .from(programDays)
      .where(eq(programDays.programId, aliceCopy))
      .orderBy(asc(programDays.orderIndex))
    await db
      .update(programExercises)
      .set({ targetWeightKg: '100' })
      .where(eq(programExercises.programDayId, aliceDay.id))

    expect((await exercisesOf(aliceCopy))[0].targetWeightKg).toBe('100.00')
    expect(await exercisesOf(templateId)).toEqual(templateBefore)
    expect(await exercisesOf(bobCopy)).toEqual(bobBefore)
  })

  it('completes the previous active program so only one is active', async () => {
    const alice = await makeClient(trainerId)
    const first = await assign(alice, '2026-10-04')
    const second = await assign(alice, '2026-11-01')

    const rows = await db.query.programs.findMany({
      where: eq(programs.clientId, alice),
    })
    const status = Object.fromEntries(rows.map((row) => [row.id, row.status]))
    expect(status[first]).toBe('completed')
    expect(status[second]).toBe('active')
  })

  it("refuses another trainer's template and a client copy", async () => {
    const alice = await makeClient(trainerId)
    const otherTrainer = await makeTrainer()
    await expect(
      db.transaction((tx) =>
        assignProgram(tx, {
          trainerId: otherTrainer,
          templateId,
          clientId: alice,
          startsOn: '2026-10-04',
        }),
      ),
    ).rejects.toThrow(ForbiddenError)

    const copyId = await assign(alice)
    await expect(
      db.transaction((tx) =>
        assignProgram(tx, {
          trainerId,
          templateId: copyId,
          clientId: alice,
          startsOn: '2026-10-04',
        }),
      ),
    ).rejects.toThrow(RuleError)
  })

  it('enforces one active program per client in the database too', async () => {
    const alice = await makeClient(trainerId)
    await assign(alice)
    expect(
      await violation(() =>
        db.insert(programs).values({
          trainerId,
          clientId: alice,
          nameEn: 'Sneaky second',
          status: 'active',
          startsOn: '2026-10-04',
        }),
      ),
    ).toBe('programs_one_active_per_client')
  })
})
