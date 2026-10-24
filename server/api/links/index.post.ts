import { LinkCreationSchema } from '#shared/schemas/link.schema';

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

    const requestURL = getRequestURL(event);
    await purgeLinkRedirect(requestURL.origin, link.slug);

    return {
      statusCode: 201,
      statusMessage: 'Link created successfully',
      body: {
        link
      }
    };
  } catch (error) {
    throw toLinkConflictError(error);
  }
});
