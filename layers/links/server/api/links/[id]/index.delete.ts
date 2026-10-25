import { requireUser } from '#layers/auth/server/current-user';
import { useLinkService } from '#layers/links/server/container';
import { defineLinkEventHandler, readLinkId } from '#layers/links/server/http';

export default defineLinkEventHandler(async (event) => {
  const user = await requireUser(event);
  const id = readLinkId(event);

  const linkService = await useLinkService(event);
  await linkService.delete(user.id, id);

  setResponseStatus(event, 204);

  return null;
});
