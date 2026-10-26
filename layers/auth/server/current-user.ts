import type { EventHandlerRequest, H3Event } from 'h3';
import type { User } from '#layers/auth/shared/domain/user.type';
import {
  getAuth,
  type AuthInstance
} from '#layers/auth/server/infrastructure/better-auth';
// declares the Session getter and its memo on event.context
import type {} from './types/context';

export type AuthSession = Awaited<
  ReturnType<AuthInstance['api']['getSession']>
>;

// memoized per request, so the session middleware's getter, the SSR auth
// plugin and requireUser share one lookup
export const getAuthSession = (
  event: H3Event<EventHandlerRequest>
): Promise<AuthSession> => {
  event.context.authSessionLookup ??= getAuth(event).api.getSession({
    headers: event.headers
  });

  return event.context.authSessionLookup;
};

export const requireUser = async (event: H3Event<EventHandlerRequest>) => {
  const session = await getAuthSession(event);

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  event.context.user = session.user;

  return session.user as User;
};
