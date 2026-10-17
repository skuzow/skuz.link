import type { EventHandlerRequest, H3Event } from 'h3';
import type { Link } from '~~/shared/types/link.type';
import { LinkAlreadyInUseError } from './errors';
import { useRepository, type RepositoryInstance } from './repository';

export const requireOwnedLink = async (
  event: H3Event<EventHandlerRequest>,
  userId: string
): Promise<{ repository: RepositoryInstance; link: Link }> => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fields'
    });
  }

  const repository = await useRepository(event);
  const link = await repository.link.findOwnedById(id, userId);

  if (!link) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Link not found'
    });
  }

  return { repository, link };
};

export const toLinkConflictError = (error: unknown) => {
  if (error instanceof LinkAlreadyInUseError) {
    return createError({
      statusCode: 409,
      statusMessage: 'Link already in use'
    });
  }

  return error;
};
