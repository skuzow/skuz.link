import type { EventHandlerRequest, H3Event } from 'h3';
import { useDB } from '#layers/base/server/platform/db';
import LinkService from '#layers/links/server/application/link.service';
import RedirectService from '#layers/links/server/application/redirect.service';
import LinkRedirectCache from '#layers/links/server/infrastructure/link-redirect-cache';
import LinkRepository from '#layers/links/server/infrastructure/link.repository';

// built per request: the D1 binding and the origin come from the request
const useAdapters = async (event: H3Event<EventHandlerRequest>) => ({
  repository: new LinkRepository(await useDB(event)),
  redirectCache: new LinkRedirectCache(event, getRequestURL(event).origin)
});

export const useLinkService = async (
  event: H3Event<EventHandlerRequest>
): Promise<LinkService> => {
  const { repository, redirectCache } = await useAdapters(event);

  return new LinkService(repository, redirectCache);
};

export const useRedirectService = async (
  event: H3Event<EventHandlerRequest>
): Promise<RedirectService> => {
  const { repository, redirectCache } = await useAdapters(event);

  return new RedirectService(event, repository, redirectCache);
};
