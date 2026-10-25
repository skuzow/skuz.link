import { requireUser } from '#layers/auth/server/current-user';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const input = await readLinkInput(event);

  const repository = await useRepository(event);

  try {
    const link = await repository.link.create(user.id, input);

    await purgeLinkRedirects(getRequestURL(event).origin, [link.slug]);

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
