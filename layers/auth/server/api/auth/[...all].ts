import { getAuth } from '#layers/auth/server/infrastructure/better-auth';

export default defineEventHandler((event) => {
  const auth = getAuth(event);

  return auth.handler(toWebRequest(event));
});
