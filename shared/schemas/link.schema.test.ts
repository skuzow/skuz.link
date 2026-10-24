import { describe, expect, it } from 'vitest';
import {
  LINK_REDIRECT_URL_MAX,
  LINK_SLUG_MAX,
  LINK_SLUG_REGEX,
  RESERVED_LINK_SLUGS
} from '../constants/link.constant';
import {
  LinkCreationSchema,
  LinkRedirectUrlSchema,
  LinkSlugSchema,
  isReservedLinkSlug,
  normalizeLinkSlug
} from './link.schema';

const issueCodes = (result: { error?: { issues: { code: string }[] } }) =>
  result.error?.issues.map((issue) => issue.code);

describe('normalizeLinkSlug', () => {
  it.each([
    ['repo', 'repo'],
    ['  repo  ', 'repo'],
    ['/repo', 'repo'],
    ['//repo', 'repo'],
    [' /Repo ', 'repo'],
    ['MY-Link', 'my-link']
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeLinkSlug(input)).toBe(expected);
  });
});

describe('isReservedLinkSlug', () => {
  it('flags app routes and leaves free slugs alone', () => {
    expect(isReservedLinkSlug('login')).toBe(true);
    expect(isReservedLinkSlug('links')).toBe(true);
    expect(isReservedLinkSlug('my-docs')).toBe(false);
  });

  it('only stores slugs that the slug format accepts', () => {
    for (const slug of RESERVED_LINK_SLUGS) {
      expect(slug, slug).toMatch(LINK_SLUG_REGEX);
    }
  });
});

describe('LinkSlugSchema', () => {
  it.each([
    ['a', 'a'],
    ['repo', 'repo'],
    ['my-link', 'my-link'],
    ['my_link', 'my_link'],
    ['1a', '1a'],
    ['a'.repeat(LINK_SLUG_MAX), 'a'.repeat(LINK_SLUG_MAX)],
    [' /Repo ', 'repo']
  ])('accepts %j as %j', (input, expected) => {
    expect(LinkSlugSchema.parse(input)).toBe(expected);
  });

  it.each([
    ['', 'too_small'],
    ['/', 'too_small'],
    ['a'.repeat(LINK_SLUG_MAX + 1), 'too_big']
  ])('rejects %j with %s', (input, code) => {
    expect(issueCodes(LinkSlugSchema.safeParse(input))).toContain(code);
  });

  it.each(['-a', 'a-', '_a', 'a_', 'a.b', 'a b', 'a/b', 'ñu', 'a?b'])(
    'rejects badly formatted %j with invalid_string',
    (input) => {
      expect(issueCodes(LinkSlugSchema.safeParse(input))).toEqual([
        'invalid_string'
      ]);
    }
  );

  it.each(['login', 'API', '/Links', 'es'])(
    'rejects reserved %j with custom',
    (input) => {
      expect(issueCodes(LinkSlugSchema.safeParse(input))).toEqual(['custom']);
    }
  );
});

describe('LinkRedirectUrlSchema', () => {
  it.each([
    ['https://example.com', 'https://example.com'],
    ['http://example.com/path?q=1#hash', 'http://example.com/path?q=1#hash'],
    ['  https://example.com/repo  ', 'https://example.com/repo'],
    ['HTTPS://example.com/Repo', 'HTTPS://example.com/Repo'],
    ['Http://example.com', 'Http://example.com']
  ])('accepts %j as %j', (input, expected) => {
    expect(LinkRedirectUrlSchema.parse(input)).toBe(expected);
  });

  it.each([
    '',
    'example.com',
    '/relative/path',
    'not a url',
    'javascript:alert(1)',
    'data:text/html,hello',
    'ftp://example.com',
    'mailto:someone@example.com',
    `https://example.com/${'a'.repeat(LINK_REDIRECT_URL_MAX)}`
  ])('rejects %j', (input) => {
    expect(LinkRedirectUrlSchema.safeParse(input).success).toBe(false);
  });
});

describe('LinkCreationSchema', () => {
  it('normalizes the slug and drops fields the client must not set', () => {
    const result = LinkCreationSchema.parse({
      slug: ' /Repo ',
      redirectUrl: 'https://example.com',
      id: 'forged-id',
      userId: 'someone-else',
      clicks: 999
    });

    expect(result).toEqual({
      slug: 'repo',
      redirectUrl: 'https://example.com'
    });
  });

  it('requires both fields', () => {
    const result = LinkCreationSchema.safeParse({});

    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
      'slug',
      'redirectUrl'
    ]);
  });
});
