import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { User } from 'better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { testUtils } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import {
  createApp,
  createRouter,
  toWebHandler,
  type EventHandler,
  type RouterMethod
} from 'h3';
import { afterAll, expect, vi } from 'vitest';
import * as authSchema from '#layers/auth/server/infrastructure/schema';
import type { Link } from '#layers/links/shared/domain/link.type';
import * as linksSchema from '#layers/links/server/infrastructure/schema';
import { runtimeConfig } from '#layers/base/server/platform/runtimeConfig';
import { createTestPlatform } from './platform';

export const TEST_ORIGIN: string = runtimeConfig.betterAuth.url;

const schema = { ...authSchema, ...linksSchema };

const ROOT_DIR = new URL('../../', import.meta.url);
const LAYERS_DIR = new URL('layers/', ROOT_DIR);
const METHOD_SUFFIX_REGEX: RegExp =
  /\.(get|post|put|patch|delete|head|options)$/;

interface TestRequestInit extends Omit<RequestInit, 'body'> {
  json?: unknown;
  origin?: string;
}

// Nitro's scan order: root first, then layers in reverse alphabetical order
const listServerDirs = () => [
  new URL('server/', ROOT_DIR),
  ...readdirSync(LAYERS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a))
    .map((layer) => new URL(`${layer}/server/`, LAYERS_DIR))
];

const listHandlerFiles = (dir: URL) => {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
    .sort();
};

const loadHandler = async (file: URL): Promise<EventHandler> => {
  const module = await import(fileURLToPath(file));

  return module.default;
};

// mirrors Nitro file routing: index.get.ts, [id], [...all]
const toApiRoute = (file: string) => {
  const path = file.replace(/\.ts$/, '');
  const method = path.match(METHOD_SUFFIX_REGEX)?.[1] as
    RouterMethod | undefined;

  const route = path
    .replace(METHOD_SUFFIX_REGEX, '')
    .replace(/(^|\/)index$/, '')
    .replace(/\[\.\.\.\w*\]/g, '**')
    .replace(/\[(\w+)\]/g, ':$1');

  return { route: `/api/${route}`.replace(/\/$/, ''), method };
};

const createTestApp = async () => {
  const app = createApp();
  const serverDirs = listServerDirs();

  for (const serverDir of serverDirs) {
    const middlewareDir = new URL('middleware/', serverDir);

    for (const file of listHandlerFiles(middlewareDir)) {
      app.use(await loadHandler(new URL(file, middlewareDir)));
    }
  }

  const router = createRouter();
  // Nitro keeps the first handler per route and method, so root wins
  const registeredRoutes = new Set<string>();

  for (const serverDir of serverDirs) {
    const apiDir = new URL('api/', serverDir);

    for (const file of listHandlerFiles(apiDir)) {
      const { route, method } = toApiRoute(file);
      const routeKey = `${method ?? '*'} ${route}`;
      if (registeredRoutes.has(routeKey)) continue;

      registeredRoutes.add(routeKey);
      router.add(route, await loadHandler(new URL(file, apiDir)), method);
    }
  }

  app.use(router);

  return app;
};

/**
 * Runs the real server middleware and API routes on a fresh local D1 and
 * Workers cache. The cache is not cleared between tests, so give each test
 * its own slugs.
 */
export const setupTestServer = async () => {
  const platform = await createTestPlatform();
  vi.stubGlobal('caches', platform.caches);

  const db = drizzle(platform.env.db, { schema });
  const handle = toWebHandler(await createTestApp());

  const pending: Promise<unknown>[] = [];
  const executionContext = {
    waitUntil: (promise: Promise<unknown>) => {
      pending.push(promise);
    },
    passThroughOnException: () => {}
  };

  const testAuth = betterAuth({
    baseURL: runtimeConfig.betterAuth.url,
    secret: runtimeConfig.betterAuth.secret,
    database: drizzleAdapter(db, { provider: 'sqlite', schema }),
    plugins: [testUtils()]
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    await platform.dispose();
  });

  const fetch = (
    path: string,
    { json, origin = TEST_ORIGIN, headers, ...init }: TestRequestInit = {}
  ) => {
    const url = new URL(path, origin);
    const requestHeaders = new Headers(headers);

    requestHeaders.set('host', url.host);
    requestHeaders.set('origin', url.origin);
    if (json !== undefined) {
      requestHeaders.set('content-type', 'application/json');
    }

    const request = new Request(url, {
      ...init,
      headers: requestHeaders,
      body: json === undefined ? undefined : JSON.stringify(json)
    });

    return handle(request, {
      cloudflare: { env: platform.env, context: executionContext }
    });
  };

  const flush = async () => {
    while (pending.length) await Promise.all(pending.splice(0));
  };

  const login = async (overrides: Partial<User> = {}) => {
    const { test } = await testAuth.$context;

    const user = await test.saveUser(test.createUser(overrides));
    const { headers } = await test.login({ userId: user.id });

    return { user, headers };
  };

  const createLink = async (
    headers: Headers,
    slug: string,
    redirectUrl = `https://example.com/${slug}`
  ) => {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers,
      json: { slug, redirectUrl }
    });

    expect(response.status).toBe(200);

    const { body } = await response.json();

    return body.link as Link;
  };

  const redirectTarget = async (slug: string) => {
    const response = await fetch(`/${slug}`);
    await flush();

    return response.status === 302 ? response.headers.get('location') : null;
  };

  const reset = async () => {
    await db.delete(schema.links);
    await db.delete(schema.session);
    await db.delete(schema.account);
    await db.delete(schema.user);
  };

  return { db, fetch, flush, login, createLink, redirectTarget, reset };
};
