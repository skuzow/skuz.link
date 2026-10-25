import type { EventHandlerRequest, H3Event } from 'h3';
import { useDB } from '#layers/base/server/platform/db';
import LinkService from '#layers/links/server/application/link.service';
import LinkRedirectCache from '#layers/links/server/infrastructure/link-redirect-cache';
import LinkRepository from '#layers/links/server/infrastructure/link.repository';

// built per request: the D1 binding and the origin come from the request
export const useLinkService = async (
  event: H3Event<EventHandlerRequest>
): Promise<LinkService> => {
  const db = await useDB(event);

  return new LinkService(
    new LinkRepository(db),
    new LinkRedirectCache(event, getRequestURL(event).origin)
  );
};
