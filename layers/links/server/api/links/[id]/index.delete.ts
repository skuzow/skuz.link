import { requireUser } from '#layers/auth/server/current-user';
import { requireOwnedLink } from '#layers/links/server/http';
import { purgeLinkRedirects } from '#layers/links/server/infrastructure/link-redirect-cache';

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
