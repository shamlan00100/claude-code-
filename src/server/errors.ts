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
