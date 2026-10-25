import type { z } from 'zod';
import type { LinkInputSchema } from './link.schema';

export interface Link {
  id: string;
  slug: string;
  redirectUrl: string;
  userId: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export type LinkInput = z.infer<typeof LinkInputSchema>;
