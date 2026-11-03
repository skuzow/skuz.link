import { describe, expect, it } from 'vitest';
import { slugMark } from './slugMark';

const KNOWN_HUES = [
  'hue-lime',
  'hue-coral',
  'hue-mint',
  'hue-bone',
  'hue-violet',
  'hue-pink',
  'hue-blue',
  'hue-gold'
];

const SLUGS = ['github', 'repo', 'cv', 'x', 'a', 'my-link_2', 'o'.repeat(64)];

describe('slugMark', () => {
  it.each([
    ['github', 'hue-pink'],
    ['repo', 'hue-gold'],
    ['cv', 'hue-mint']
  ])('gives %s the hue of the previews', (slug, hue) => {
    expect(slugMark(slug).hue).toBe(hue);
  });

  it('gives github the shape of the previews', () => {
    expect(slugMark('github').cells).toEqual([
      [1, 0],
      [3, 0],
      [2, 0],
      [2, 1],
      [2, 2],
      [0, 3],
      [4, 3],
      [0, 4],
      [4, 4]
    ]);
  });

  it('gives a slug the same mark every time', () => {
    expect(slugMark('github')).toEqual(slugMark('github'));
  });

  it('ignores case, like slugs do', () => {
    expect(slugMark('GitHub')).toEqual(slugMark('github'));
  });

  it.each(SLUGS)('mirrors the shape of %s', (slug) => {
    const cells = slugMark(slug).cells.map(([x, y]) => `${x},${y}`);
    const mirrored = slugMark(slug).cells.map(([x, y]) => `${4 - x},${y}`);

    expect(mirrored.sort()).toEqual(cells.sort());
  });

  it.each(SLUGS)('always gives %s a known hue', (slug) => {
    expect(KNOWN_HUES).toContain(slugMark(slug).hue);
  });
});
