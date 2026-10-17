import { purgeLinkRedirect } from '~~/server/utils/link-redirect-cache';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fields'
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

  await repository.link.delete(id);

  const requestURL = getRequestURL(event);
  await purgeLinkRedirect(requestURL.origin, ownedLink.link);

  return {
    statusCode: 200,
    statusMessage: 'Link deleted successfully'
  };
});
