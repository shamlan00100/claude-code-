import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import type { Role } from '#/lib/auth'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

/** The signed-in user for the current request. Server code only. */
export async function readSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) return null
  const { id, name, email, role } = session.user
  return { id, name, email, role: role as Role }
}
