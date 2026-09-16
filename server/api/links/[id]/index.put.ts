import { LinkUpdateSchema } from '#shared/schemas/link.schema';
import { LinkAlreadyInUseError } from '~~/server/utils/errors';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fields'
    });
  }

  const body = await readBody(event);
  const result = LinkUpdateSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fields',
      data: result.error.issues
    });
  }

  const repository = await useRepository(event);
  const ownedLink = await repository.link.findOwnedById(id, user.id);

  if (!ownedLink) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Link not found'
    });
  }

  try {
    const link = await repository.link.update(id, result.data);

    return {
      statusCode: 200,
      statusMessage: 'Link edited successfully',
      body: {
        link
      }
    };
  } catch (error) {
    if (error instanceof LinkAlreadyInUseError) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Link already in use'
      });
    }

    throw error;
  }
});
