export class LinkAlreadyInUseError extends Error {
  constructor() {
    super('Link already in use');
    this.name = 'LinkAlreadyInUseError';
  }
}

export const isUniqueConstraintError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  return /UNIQUE constraint failed/i.test(message);
};
