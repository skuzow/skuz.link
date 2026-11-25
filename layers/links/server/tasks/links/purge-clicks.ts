import { lt } from 'drizzle-orm';
import { getDB } from '#layers/base/server/platform/db';
import { clicks } from '#layers/links/server/infrastructure/schema';

// a day short of the promised 12 months, because the task runs only once a
// day: a Click that turns 364 days old just after a run must still go in time
const CLICK_RETENTION_MS = 364 * 24 * 60 * 60 * 1000;

// a Click's details go at the latest 12 months after it happened (ADR-0007);
// the Click count on its Link never goes down
export default defineTask({
  meta: {
    name: 'links:purge-clicks',
    description: 'Delete the Clicks older than 364 days'
  },
  async run() {
    const cutoff = new Date(Date.now() - CLICK_RETENTION_MS);

    // the Worker's scheduled handler keeps the bindings on globalThis
    await getDB().delete(clicks).where(lt(clicks.createdAt, cutoff));

    return { result: 'ok' };
  }
});
