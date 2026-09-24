import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { isDate, isTime } from '#/lib/time'

import {
  addClientForTrainer,
  bookSessionForTrainer,
  clientDetailForTrainer,
  listClientsForTrainer,
  sellPackageForTrainer,
  todayForTrainer,
} from './trainer.server'

export type {
  ClientDetail,
  ClientRow,
  PackageView,
  TodayView,
} from './trainer.server'

// Entry points the browser calls. Input is validated here; the work, and
// every ownership check, happens in trainer.server.ts.

const location = z.enum(['gym', 'home', 'outdoor', 'online'])
const uuid = z.uuid()
const blankToNull = (value: string | null | undefined) => value?.trim() || null

export const listClients = createServerFn({ method: 'GET' }).handler(() =>
  listClientsForTrainer(),
)

export const addClient = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      fullName: z.string().trim().min(1).max(120),
      phone: z.string().max(40).nullish().transform(blankToNull),
      email: z
        .union([z.email(), z.literal('')])
        .nullish()
        .transform(blankToNull),
    }),
  )
  .handler(({ data }) => addClientForTrainer(data))

export const getClientDetail = createServerFn({ method: 'GET' })
  .validator(z.object({ clientId: uuid }))
  .handler(({ data }) => clientDetailForTrainer(data.clientId))

export const sellPackageFn = createServerFn({ method: 'POST' })
  .validator(
    z
      .object({
        clientId: uuid,
        name: z.string().trim().min(1).max(80),
        structure: z.enum(['session_pack', 'monthly']),
        sessions: z.number().int().min(1).max(500),
        locations: z.array(location).min(1),
        startsOn: z.string().refine(isDate),
        expiresOn: z.string().refine(isDate).nullable(),
        priceMinor: z.number().int().min(0),
      })
      .refine(
        (value) => !value.expiresOn || value.expiresOn >= value.startsOn,
        {
          path: ['expiresOn'],
        },
      ),
  )
  .handler(({ data }) => sellPackageForTrainer(data))

export const bookSessionFn = createServerFn({ method: 'POST' })
  .validator(
    z
      .object({
        clientId: uuid,
        location,
        date: z.string().refine(isDate).optional(),
        time: z.string().refine(isTime).optional(),
        durationMinutes: z.number().int().min(15).max(240).optional(),
      })
      .refine((value) => Boolean(value.date) === Boolean(value.time)),
  )
  .handler(({ data }) => bookSessionForTrainer(data))

export const getTrainerToday = createServerFn({ method: 'GET' }).handler(() =>
  todayForTrainer(),
)
