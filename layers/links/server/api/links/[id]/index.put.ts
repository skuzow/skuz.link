import { requireUser } from '#layers/auth/server/current-user';
import {
  readLinkInput,
  requireOwnedLink,
  toLinkConflictError
} from '#layers/links/server/http';
import { purgeLinkRedirects } from '#layers/links/server/infrastructure/link-redirect-cache';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const { repository, link: ownedLink } = await requireOwnedLink(
    event,
    user.id
  );

  const input = await readLinkInput(event);

  try {
    const link = await repository.link.update(ownedLink.id, input);

    await purgeLinkRedirects(getRequestURL(event).origin, [
      ownedLink.slug,
      link.slug
    ]);

    return {
      statusCode: 200,
      statusMessage: 'Link edited successfully',
      body: {
        link
      }
    };
  } catch (error) {
    throw toLinkConflictError(error);
  }
});
