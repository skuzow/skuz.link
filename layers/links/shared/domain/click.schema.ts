import { z } from 'zod';

import { CLICK_RANGE_DEFAULT, CLICK_RANGES } from './click.constant';
import { decodeClickCursor } from './click.cursor';

export const ClickRangeSchema = z.enum(CLICK_RANGES);

// the query of a Link's statistics and of its Click list
export const ClicksQuerySchema = z.object({
  range: ClickRangeSchema.default(CLICK_RANGE_DEFAULT),
  // the server's cursor of the next page, sent back as it came
  cursor: z
    .string()
    .refine((value) => decodeClickCursor(value) !== null)
    .optional()
});
