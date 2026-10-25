import type { EventHandlerRequest, H3Event } from 'h3';
import { LinkInputSchema } from '#layers/links/shared/domain/link.schema';
import type { Link, LinkInput } from '#layers/links/shared/domain/link.type';
import { LinkAlreadyInUseError } from '#layers/links/shared/domain/link.error';
import {
  useRepository,
  type RepositoryInstance
} from '#layers/links/server/infrastructure/repository';

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

export const readLinkInput = async (
  event: H3Event<EventHandlerRequest>
): Promise<LinkInput> => {
  const result = LinkInputSchema.safeParse(await readBody(event));

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fields',
      data: result.error.issues
    });
  }

  return result.data;
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
