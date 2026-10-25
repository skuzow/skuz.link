import { getAuthSession } from '#layers/auth/server/current-user';

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event);
  event.context.authSession = session;
});
