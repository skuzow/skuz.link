import { requireUser } from '#layers/auth/server/current-user';
import { useLinkService } from '#layers/links/server/container';
import { defineLinkEventHandler } from '#layers/links/server/http';

export default defineLinkEventHandler(async (event) => {
  const user = await requireUser(event);

  const linkService = await useLinkService(event);

  return linkService.list(user.id);
});
