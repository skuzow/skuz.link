import { describe, expect, it } from 'vitest';
import { setupTestRouter } from '@/testing/router';

const { navigate, login } = setupTestRouter();

describe('guest middleware', () => {
  it('lets guests open the login page', async () => {
    expect(await navigate('/login')).toBe('/login');
  });

  it('sends signed-in users to their links', async () => {
    login();

    expect(await navigate('/login')).toBe('/links');
  });

  it('keeps the locale when sending signed-in users to their links', async () => {
    login();

    expect(await navigate('/es/login')).toBe('/es/links');
  });
});
