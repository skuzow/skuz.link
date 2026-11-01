import { lt } from 'drizzle-orm';
import { session } from '#layers/auth/server/infrastructure/schema';
import { getDB } from '#layers/base/server/platform/db';

// a day short of the promised 30, because the task runs only once a day: a
// Session that expires just after a run must still go within the 30 days
const SESSION_RETENTION_MS = 29 * 24 * 60 * 60 * 1000;

// a Session and its IP address go at the latest 30 days after it expires
// (ADR-0005); signing out and revoking already delete it at once
export default defineTask({
  meta: {
    name: 'auth:purge-sessions',
    description: 'Delete the Sessions that expired more than 29 days ago'
  },
  async run() {
    const cutoff = new Date(Date.now() - SESSION_RETENTION_MS);

    // the Worker's scheduled handler keeps the bindings on globalThis
    await getDB().delete(session).where(lt(session.expiresAt, cutoff));

    return { result: 'ok' };
  }
});
