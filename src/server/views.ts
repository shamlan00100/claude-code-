import type { sessions } from '#/db/schema'

type SessionRow = typeof sessions.$inferSelect

/** What the UI needs to draw a session card. Plain JSON, no Date objects. */
export interface SessionView {
  id: string
  status: SessionRow['status']
  kind: SessionRow['kind']
  location: SessionRow['location']
  start: string | null
  end: string | null
  clientId: string
  clientName?: string
  packageId: string | null
  packageName?: string | null
  creditOutcome: SessionRow['creditOutcome']
}

export function toSessionView(
  row: SessionRow,
  extra: { clientName?: string; packageName?: string | null } = {},
): SessionView {
  return {
    id: row.id,
    status: row.status,
    kind: row.kind,
    location: row.location,
    start: row.scheduledStart?.toISOString() ?? null,
    end: row.scheduledEnd?.toISOString() ?? null,
    clientId: row.clientId,
    packageId: row.packageId,
    creditOutcome: row.creditOutcome,
    ...extra,
  }
}
