import type { EventHandlerRequest, H3Event } from 'h3';
import type { User } from '~~/shared/types/user.type';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import * as schema from '../database/schema';
import { getDB } from './db';
import { runtimeConfig } from './runtimeConfig';
import { useRepository } from './repository';

const createAuth = (event?: H3Event<EventHandlerRequest>) => {
  return betterAuth({
    appName: 'skuz.link',
    baseURL: runtimeConfig.betterAuth.url,
    trustedOrigins: [
      'http://localhost:3000',
      'http://localhost:8787',
      runtimeConfig.betterAuth.url
    ],
    secret: runtimeConfig.betterAuth.secret,
    database: drizzleAdapter(getDB(event), {
      provider: 'sqlite',
      schema
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60
      }
    },
    account: {
      accountLinking: {
        enabled: true
      }
    },
    user: {
      deleteUser: {
        enabled: true,
        beforeDelete: async (user) => {
          if (!event) return;

          const repository = await useRepository(event);

          await repository.link.deleteAllByUserId(user.id);
        }
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
};

type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | undefined;

export const getAuth = (event?: H3Event<EventHandlerRequest>) => {
  if (authInstance) return authInstance;

  const generatedAuth = createAuth(event);

  if (event) authInstance = generatedAuth;

  return generatedAuth;
};

let _auth: AuthInstance | undefined;

// for cli: pnpm auth:schema
const isAuthSchemaCommand = process.argv.some((arg) =>
  arg.includes('server/database/schema/auth.ts')
);

if (isAuthSchemaCommand) _auth = getAuth();

export const auth = _auth;

export const getAuthSession = async (event: H3Event<EventHandlerRequest>) => {
  const auth = getAuth(event);

  const session = await auth.api.getSession({
    headers: event.headers
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
