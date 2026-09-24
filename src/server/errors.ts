/** Thrown when the signed-in user may not touch a row. */
export class ForbiddenError extends Error {
  constructor(message = 'Not allowed') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/** Thrown when a requested change breaks a business rule. */
export class RuleError extends Error {
  constructor(
    readonly code: string,
    message: string = code,
  ) {
    super(message)
    this.name = 'RuleError'
  }
}

/** The Postgres error behind a Drizzle error, if there is one. */
function pgError(error: unknown): { code?: string; constraint?: string } {
  const cause = (error as { cause?: unknown }).cause
  return (cause ?? error) as { code?: string; constraint?: string }
}

/** Turns known constraint violations into rule errors the UI can explain. */
export function asRuleError(error: unknown): unknown {
  const pg = pgError(error)
  if (pg.constraint === 'sessions_no_trainer_overlap') {
    return new RuleError('trainer_busy')
  }
  if (pg.constraint === 'programs_one_active_per_client') {
    return new RuleError('program_already_active')
  }
  return error
}
