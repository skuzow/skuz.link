import type { EventHandlerRequest, H3Event } from 'h3';
import { describe, expect, it, vi } from 'vitest';
import { scheduleBackground } from './background';

describe('scheduleBackground', () => {
  it('hands the task to the Cloudflare execution context', () => {
    const waitUntil = vi.fn();
    const cloudflareEvent = {
      context: { cloudflare: { context: { waitUntil } } }
    } as unknown as H3Event<EventHandlerRequest>;

    scheduleBackground(cloudflareEvent, Promise.resolve());

    expect(waitUntil).toHaveBeenCalledTimes(1);
  });

  it('falls back to the event waitUntil', () => {
    const waitUntil = vi.fn();
    const nitroEvent = {
      context: { waitUntil }
    } as unknown as H3Event<EventHandlerRequest>;

    scheduleBackground(nitroEvent, Promise.resolve());

    expect(waitUntil).toHaveBeenCalledTimes(1);
  });
});
