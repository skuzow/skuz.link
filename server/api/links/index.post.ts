import { LinkCreationSchema } from '#shared/schemas/link.schema';
import { LinkAlreadyInUseError } from '~~/server/utils/errors';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const result = LinkCreationSchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fields',
      data: result.error.issues
    });
  }

  const repository = await useRepository(event);

  try {
    const link = await repository.link.create(user.id, result.data);

    return {
      statusCode: 201,
      statusMessage: 'Link created successfully',
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
