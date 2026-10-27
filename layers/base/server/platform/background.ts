import type { EventHandlerRequest, H3Event } from 'h3';

export function scheduleBackground(
  event: H3Event<EventHandlerRequest>,
  task: Promise<void>
) {
  const executionContext = event.context.cloudflare?.context;
  if (executionContext) {
    executionContext.waitUntil(task);
    return;
  }

  if (event.context.waitUntil) {
    event.context.waitUntil(task);
    return;
  }

  void task;
}
