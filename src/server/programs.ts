import { and, asc, eq, inArray } from 'drizzle-orm'

import { programDays, programExercises, programs } from '#/db/schema'

import type { Tx } from './db-types'
import { ForbiddenError, RuleError } from './errors'

/**
 * Assigns a template to a client by copying it: program, days and exercises,
 * keeping every order. Any program the client already has active is marked
 * completed first, so there is only ever one active program per client.
 * The caller must already have checked that the trainer coaches the client.
 */
export async function assignProgram(
  tx: Tx,
  input: {
    trainerId: string
    templateId: string
    clientId: string
    startsOn: string
  },
): Promise<string> {
  const template = await tx.query.programs.findFirst({
    where: eq(programs.id, input.templateId),
  })
  if (!template) throw new RuleError('program_not_found')
  if (template.trainerId !== input.trainerId) throw new ForbiddenError()
  if (template.clientId !== null) throw new RuleError('not_a_template')

  await tx
    .update(programs)
    .set({ status: 'completed' })
    .where(
      and(eq(programs.clientId, input.clientId), eq(programs.status, 'active')),
    )

  const [copy] = await tx
    .insert(programs)
    .values({
      trainerId: input.trainerId,
      clientId: input.clientId,
      sourceProgramId: template.id,
      nameEn: template.nameEn,
      nameAr: template.nameAr,
      notes: template.notes,
      status: 'active',
      startsOn: input.startsOn,
    })
    .returning({ id: programs.id })

  const days = await tx
    .select()
    .from(programDays)
    .where(eq(programDays.programId, template.id))
    .orderBy(asc(programDays.orderIndex))
  if (days.length === 0) return copy.id

  const dayCopies = await tx
    .insert(programDays)
    .values(
      days.map((day) => ({
        programId: copy.id,
        orderIndex: day.orderIndex,
        name: day.name,
        notes: day.notes,
      })),
    )
    .returning({ id: programDays.id })
  // Inserted in the same order as selected, so indexes line up.
  const newDayId = new Map(days.map((day, i) => [day.id, dayCopies[i].id]))

  const exercises = await tx
    .select()
    .from(programExercises)
    .where(
      inArray(
        programExercises.programDayId,
        days.map((day) => day.id),
      ),
    )
  if (exercises.length > 0) {
    await tx.insert(programExercises).values(
      exercises.map(({ id: _id, programDayId, ...rest }) => ({
        ...rest,
        programDayId: newDayId.get(programDayId)!,
      })),
    )
  }
  return copy.id
}
