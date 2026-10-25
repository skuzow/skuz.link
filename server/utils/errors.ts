export class LinkAlreadyInUseError extends Error {
  constructor() {
    super('Link already in use');
    this.name = 'LinkAlreadyInUseError';
  }
}
