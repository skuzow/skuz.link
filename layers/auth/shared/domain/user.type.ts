import type { user } from '#layers/auth/server/infrastructure/schema';

export type User = typeof user.$inferSelect;
