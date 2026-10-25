const UNIQUE_CONSTRAINT_ERROR_REGEX: RegExp = /UNIQUE constraint failed/i;

export const isUniqueConstraintError = (error: unknown) => {
  return (
    error instanceof Error &&
    UNIQUE_CONSTRAINT_ERROR_REGEX.test(`${error.message} ${error.cause ?? ''}`)
  );
};
