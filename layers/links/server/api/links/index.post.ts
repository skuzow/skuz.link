import { requireUser } from '#layers/auth/server/current-user';
import { useLinkService } from '#layers/links/server/container';
import {
  defineLinkEventHandler,
  readLinkInput
} from '#layers/links/server/http';

export default defineLinkEventHandler(async (event) => {
  const user = await requireUser(event);
  const input = await readLinkInput(event);

  const linkService = await useLinkService(event);
  const link = await linkService.create(user.id, input);

  setResponseStatus(event, 201);

  return link;
});
