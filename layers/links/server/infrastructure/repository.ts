import type { EventHandlerRequest, H3Event } from 'h3';
import { useDB } from '#layers/base/server/platform/db';
import LinkRepository from './link.repository';

export interface RepositoryInstance {
  link: LinkRepository;
}

export const useRepository = async (
  event: H3Event<EventHandlerRequest>
): Promise<RepositoryInstance> => {
  const db = await useDB(event);

  return {
    link: new LinkRepository(db)
  };
};
