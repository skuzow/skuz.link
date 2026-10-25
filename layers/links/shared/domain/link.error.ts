export class LinkAlreadyInUseError extends Error {
  constructor() {
    super('Link already in use');
    this.name = 'LinkAlreadyInUseError';
  }
}

// also thrown when the caller is not the Owner, so a Link's existence never leaks
export class LinkNotFoundError extends Error {
  constructor() {
    super('Link not found');
    this.name = 'LinkNotFoundError';
  }
}
