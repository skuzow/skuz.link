import type { EventHandlerRequest, H3Event } from 'h3';
import type { User } from '#layers/auth/shared/domain/user.type';
import { getAuth } from '#layers/auth/server/infrastructure/better-auth';

export const getAuthSession = async (event: H3Event<EventHandlerRequest>) => {
  const auth = getAuth(event);

  const session = await auth.api.getSession({
    headers: event.headers
  });

  return session;
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
