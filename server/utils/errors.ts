export class LinkAlreadyInUseError extends Error {
  constructor() {
    super('Link already in use');
    this.name = 'LinkAlreadyInUseError';
  }
}

const UNIQUE_CONSTRAINT_ERROR_REGEX: RegExp = /UNIQUE constraint failed/i;

export const isUniqueConstraintError = (error: unknown) => {
  return (
    error instanceof Error &&
    UNIQUE_CONSTRAINT_ERROR_REGEX.test(`${error.message} ${error.cause ?? ''}`)
  );
};
