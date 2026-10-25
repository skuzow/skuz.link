import { requireUser } from '#layers/auth/server/current-user';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const { repository, link } = await requireOwnedLink(event, user.id);

  await repository.link.delete(link.id);

  await purgeLinkRedirects(getRequestURL(event).origin, [link.slug]);

  return {
    statusCode: 200,
    statusMessage: 'Link deleted successfully'
  };
});
