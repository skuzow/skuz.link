import { z } from 'zod';

import { CLICK_RANGE_DEFAULT, CLICK_RANGES } from './click.constant';

export const ClickRangeSchema = z.enum(CLICK_RANGES);

// the query of a Link's statistics and of its Click list
export const ClicksQuerySchema = z.object({
  range: ClickRangeSchema.default(CLICK_RANGE_DEFAULT)
});
