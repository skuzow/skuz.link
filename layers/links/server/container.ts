import type { EventHandlerRequest, H3Event } from 'h3';
import { useDB } from '#layers/base/server/platform/db';
import LinkService from '#layers/links/server/application/link.service';
import RedirectService from '#layers/links/server/application/redirect.service';
import StatisticsService from '#layers/links/server/application/statistics.service';
import ClickRepository from '#layers/links/server/infrastructure/click.repository';
import LinkRedirectCache from '#layers/links/server/infrastructure/link-redirect-cache';
import LinkRepository from '#layers/links/server/infrastructure/link.repository';

// built per request: the D1 binding and the origin come from the request
const useAdapters = async (event: H3Event<EventHandlerRequest>) => {
  const db = await useDB(event);

  return {
    repository: new LinkRepository(db),
    clickRepository: new ClickRepository(db),
    redirectCache: new LinkRedirectCache(event, getRequestURL(event).origin)
  };
};

export const useLinkService = async (
  event: H3Event<EventHandlerRequest>
): Promise<LinkService> => {
  const { repository, redirectCache } = await useAdapters(event);

  return new LinkService(repository, redirectCache);
};

export const useRedirectService = async (
  event: H3Event<EventHandlerRequest>
): Promise<RedirectService> => {
  const { repository, clickRepository, redirectCache } =
    await useAdapters(event);

  return new RedirectService(event, repository, clickRepository, redirectCache);
};

export const useStatisticsService = async (
  event: H3Event<EventHandlerRequest>
): Promise<StatisticsService> => {
  const { repository, clickRepository, redirectCache } =
    await useAdapters(event);

  return new StatisticsService(
    new LinkService(repository, redirectCache),
    clickRepository
  );
};
