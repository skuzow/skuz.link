import type { z } from 'zod';
import type { links } from '~~/server/database/schema';
import type { LinkCreationSchema } from '../schemas/link.schema';

export type Link = typeof links.$inferSelect;
export type LinkCreation = z.infer<typeof LinkCreationSchema>;
