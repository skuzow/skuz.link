import type { EventHandlerRequest, H3Event } from 'h3';
import type { User } from '~~/shared/types/user.type';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import * as schema from '../database/schema';
import { getDB } from './db';
import { runtimeConfig } from './runtimeConfig';

let authInstance: ReturnType<typeof betterAuth>;

export const useAuth = (event?: H3Event<EventHandlerRequest>) => {
  if (!authInstance) {
    const generatedAuth = betterAuth({
      appName: 'skuz.link',
      baseURL: runtimeConfig.public.baseUrl,
      trustedOrigins: [
        'http://localhost:3000',
        'http://localhost:8787',
        runtimeConfig.public.baseUrl
      ],
      secret: runtimeConfig.betterAuth.secret,
      database: drizzleAdapter(getDB(event), {
        provider: 'sqlite',
        schema
      }),
      account: {
        accountLinking: {
          enabled: true
        }
      },
      socialProviders: {
        google: {
          clientId: runtimeConfig.google.clientId,
          clientSecret: runtimeConfig.google.clientSecret
        },
        github: {
          clientId: runtimeConfig.github.clientId,
          clientSecret: runtimeConfig.github.clientSecret
        }
      },
      plugins: [admin()]
    });

    if (!event) return generatedAuth;
    authInstance = generatedAuth;
  }

  return authInstance;
};

// for cli
export const auth = useAuth();

export const getAuthSession = async (event: H3Event<EventHandlerRequest>) => {
  const auth = useAuth(event);

  const headers = event.headers;
  const session = await auth.api.getSession({
    headers
  });

  return session;
};

export const requireAuth = async (event: H3Event<EventHandlerRequest>) => {
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
