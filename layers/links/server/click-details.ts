import type { EventHandlerRequest, H3Event } from 'h3';
import type { ClickDetails } from '#layers/links/shared/domain/click.type';
import { CLICK_TEXT_MAX } from '#layers/links/shared/domain/click.constant';
import { readClickClient } from '#layers/links/server/click-client';

// the request's Cloudflare properties, which Nitro puts on the event context
interface CloudflarePlace {
  country?: unknown;
  region?: unknown;
  city?: unknown;
}

const readClickText = (value: unknown): string | null =>
  typeof value === 'string' && value ? value.slice(0, CLICK_TEXT_MAX) : null;

const WEB_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:']);

// the Referer's host, so one site counts once; anything else, or no Referer,
// is Direct (null)
const readReferrer = (referer: string | undefined): string | null => {
  const url = referer ? URL.parse(referer) : null;
  if (!url || !WEB_PROTOCOLS.has(url.protocol)) return null;

  // URL already lowercases the host; a trailing dot names the same site
  return readClickText(url.hostname.replace(/^www\./, '').replace(/\.$/, ''));
};

// only the place: no coordinates, postal code, timezone or network (ADR-0007),
// and never the IP address from CF-Connecting-IP or X-Forwarded-For; the
// client comes from the user agent, which is then dropped, and the Referrer
// keeps only the Referer's host
export const readClickDetails = (
  event: H3Event<EventHandlerRequest>
): ClickDetails => {
  const cf: CloudflarePlace = event.context.cf ?? {};

  return {
    createdAt: new Date(),
    country: readClickText(cf.country),
    region: readClickText(cf.region),
    city: readClickText(cf.city),
    referrer: readReferrer(getRequestHeader(event, 'referer')),
    ...readClickClient(getRequestHeader(event, 'user-agent'))
  };
};
