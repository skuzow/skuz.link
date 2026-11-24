import { describe, expect, it } from 'vitest';
import { avatarSource } from './avatarSource';

const GOOGLE_PICTURE = 'https://lh3.googleusercontent.com/a/ACg8ocJx1Yz';

describe('avatarSource', () => {
  it('asks Google for a 192px picture', () => {
    expect(avatarSource(`${GOOGLE_PICTURE}=s96-c`)).toBe(
      `${GOOGLE_PICTURE}=s192-c`
    );
  });

  it.each([
    'https://example.com/a/ACg8ocJx1Yz=s96-c',
    'https://googleusercontent.com.example.com/a/ACg8ocJx1Yz=s96-c'
  ])('leaves %s alone, which is not on Google', (image) => {
    expect(avatarSource(image)).toBe(image);
  });

  it.each([
    `${GOOGLE_PICTURE}`,
    `${GOOGLE_PICTURE}=s96`,
    `${GOOGLE_PICTURE}=s96-c-k`
  ])(
    'leaves the Google address %s alone, which has no size ending',
    (image) => {
      expect(avatarSource(image)).toBe(image);
    }
  );

  it('leaves a GitHub picture alone', () => {
    const image = 'https://avatars.githubusercontent.com/u/1234567?v=4';

    expect(avatarSource(image)).toBe(image);
  });

  it.each([null, undefined, ''])('gives back no address for %o', (image) => {
    expect(avatarSource(image)).toBe(image);
  });

  it('leaves an address it cannot read alone', () => {
    expect(avatarSource('not a url=s96-c')).toBe('not a url=s96-c');
  });
});
