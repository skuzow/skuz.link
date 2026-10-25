import type { EventHandlerRequest, H3Event } from 'h3';
import LinkRepository from '~~/server/repositories/link.repository';

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
