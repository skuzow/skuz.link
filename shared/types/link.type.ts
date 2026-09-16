import type { z } from 'zod';
import type { links } from '~~/server/database/schema';
import type {
  LinkCreationSchema,
  LinkUpdateSchema
} from '../schemas/link.schema';

export type Link = typeof links.$inferSelect;
export type LinkCreation = z.infer<typeof LinkCreationSchema>;
export type LinkUpdate = z.infer<typeof LinkUpdateSchema>;
