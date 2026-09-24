import { createServerFn } from '@tanstack/react-start'

import { readSessionUser } from './session.server'
import type { SessionUser } from './session.server'

export type { SessionUser }

/** The signed-in user, resolved on the server from the session cookie. */
export const getSessionUser = createServerFn({ method: 'GET' }).handler(() =>
  readSessionUser(),
)
