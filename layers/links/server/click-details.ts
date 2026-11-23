import type { EventHandlerRequest, H3Event } from 'h3';
import type { ClickDetails } from '#layers/links/shared/domain/click.type';
import { CLICK_TEXT_MAX } from '#layers/links/shared/domain/click.constant';

// the request's Cloudflare properties, which Nitro puts on the event context
interface CloudflarePlace {
  country?: unknown;
  region?: unknown;
  city?: unknown;
}

const readClickText = (value: unknown): string | null =>
  typeof value === 'string' && value ? value.slice(0, CLICK_TEXT_MAX) : null;

// only the place: no coordinates, postal code, timezone or network (ADR-0007),
// and never the IP address from CF-Connecting-IP or X-Forwarded-For
export const readClickDetails = (
  event: H3Event<EventHandlerRequest>
): ClickDetails => {
  const cf: CloudflarePlace = event.context.cf ?? {};

  return {
    createdAt: new Date(),
    country: readClickText(cf.country),
    region: readClickText(cf.region),
    city: readClickText(cf.city),
    referrer: null,
    browser: null,
    os: null,
    device: null,
    bot: false,
    botName: null
  };
};
