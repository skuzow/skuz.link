import { requireUser } from '#layers/auth/server/current-user';
import { useLinkService } from '#layers/links/server/container';
import {
  defineLinkEventHandler,
  readLinkId,
  readLinkInput
} from '#layers/links/server/http';

export default defineLinkEventHandler(async (event) => {
  const user = await requireUser(event);
  const id = readLinkId(event);
  const input = await readLinkInput(event);

  const linkService = await useLinkService(event);

  return linkService.update(user.id, id, input);
});
