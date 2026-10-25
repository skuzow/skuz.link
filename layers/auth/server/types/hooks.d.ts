import type { EventHandlerRequest, H3Event } from 'h3';

declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    // awaited before a User is deleted, so other contexts can clean up
    // what the database cascade cannot reach (ADR-0003)
    'auth:user:deleting': (
      event: H3Event<EventHandlerRequest>,
      userId: string
    ) => void | Promise<void>;
  }
}
