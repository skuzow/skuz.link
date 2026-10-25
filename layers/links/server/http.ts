import type { EventHandler, EventHandlerRequest, H3Event } from 'h3';
import { LinkInputSchema } from '#layers/links/shared/domain/link.schema';
import type { LinkInput } from '#layers/links/shared/domain/link.type';
import {
  LinkAlreadyInUseError,
  LinkNotFoundError
} from '#layers/links/shared/domain/link.error';

const invalidFields = (data?: unknown) =>
  createError({
    statusCode: 400,
    statusMessage: 'Invalid fields',
    data
  });

export const readLinkId = (event: H3Event<EventHandlerRequest>): string => {
  const id = getRouterParam(event, 'id');

  if (!id) throw invalidFields();

  return id;
};

export const readLinkInput = async (
  event: H3Event<EventHandlerRequest>
): Promise<LinkInput> => {
  const result = LinkInputSchema.safeParse(await readBody(event));

  if (!result.success) throw invalidFields(result.error.issues);

  return result.data;
};

const toLinkHttpError = (error: unknown) => {
  if (error instanceof LinkNotFoundError) {
    return createError({
      statusCode: 404,
      statusMessage: 'Link not found'
    });
  }

  if (error instanceof LinkAlreadyInUseError) {
    return createError({
      statusCode: 409,
      statusMessage: 'Link already in use'
    });
  }

  return error;
};

// so each Links route can throw domain errors without mapping them
export const defineLinkEventHandler = <T>(
  handler: EventHandler<EventHandlerRequest, Promise<T>>
) =>
  defineEventHandler(async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      throw toLinkHttpError(error);
    }
  });
