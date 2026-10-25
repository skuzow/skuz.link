import { getRequestURL, type EventHandlerRequest, type H3Event } from 'h3';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import * as schema from './schema';
import { getDB } from '#layers/base/server/platform/db';
import { runtimeConfig } from '#layers/base/server/platform/runtimeConfig';
import { purgeLinkRedirects } from '#layers/links/server/infrastructure/link-redirect-cache';
import { useRepository } from '#layers/links/server/infrastructure/repository';

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

          const userLinks = await repository.link.findAllByUserId(user.id);
          const { origin } = getRequestURL(event);

          await purgeLinkRedirects(
            origin,
            userLinks.map((link) => link.slug)
          );
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

// cached per request: a module-level instance would keep the first request's
// D1 binding, which goes stale when the runtime restarts (Miniflare in dev)
export const getAuth = (event?: H3Event<EventHandlerRequest>): AuthInstance => {
  if (!event) return createAuth();
  if (event.context.auth) return event.context.auth;

  const authInstance = createAuth(event);
  event.context.auth = authInstance;

  return authInstance;
};

let _auth: AuthInstance | undefined;

// for cli: pnpm auth:schema
const isAuthSchemaCommand = process.argv.some((arg) =>
  arg.includes('layers/auth/server/infrastructure/schema.ts')
);

if (isAuthSchemaCommand) _auth = getAuth();

export const auth = _auth;
