import type { z } from 'zod';
import type { links } from '~~/server/database/schema';
import type { LinkInputSchema } from '../schemas/link.schema';

export type Link = typeof links.$inferSelect;
export type LinkInput = z.infer<typeof LinkInputSchema>;
