import { describe, expect, it } from 'vitest';
import { setupTestRouter } from '@/testing/router';

const { navigate, login } = setupTestRouter();

describe('auth middleware', () => {
  it('sends guests to the login page', async () => {
    expect(await navigate('/links')).toBe('/login');
  });

  it('keeps the locale when sending guests to the login page', async () => {
    expect(await navigate('/es/links')).toBe('/es/login');
  });

  it('lets signed-in users through', async () => {
    login();

    expect(await navigate('/links')).toBe('/links');
  });
});
