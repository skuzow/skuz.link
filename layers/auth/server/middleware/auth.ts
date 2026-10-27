import { getAuthSession } from '#layers/auth/server/current-user';

// installs the getter without looking up the Session, so requests that never
// need it (Redirects) never build better-auth, whatever the middleware order
export default defineEventHandler((event) => {
  event.context.getAuthSession = () => getAuthSession(event);
});
