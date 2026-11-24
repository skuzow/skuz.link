import { z } from 'zod';

import { CLICK_RANGE_DEFAULT, CLICK_RANGES } from './click.constant';
import { decodeClickCursor } from './click.cursor';

export const ClickRangeSchema = z.enum(CLICK_RANGES);

// a country code as Cloudflare sends it; XX stands for every Click with no
// known country
export const ClickCountrySchema = z.string().regex(/^[A-Z]{2}$/);

// a Click as encodeClickCursor gave it out
const ClickCursorSchema = z
  .string()
  .refine((value) => decodeClickCursor(value) !== null);

// a Click's id as the query carries it: a positive integer, no leading zero
const ClickIdSchema = z
  .string()
  .regex(/^[1-9]\d{0,14}$/)
  .transform(Number);

// the query of a Link's statistics and of its Click list
export const ClicksQuerySchema = z.object({
  range: ClickRangeSchema.default(CLICK_RANGE_DEFAULT),
  // whether Bots' Clicks count; only "true" or "false", so a typo answers 400
  bots: z.stringbool({ truthy: ['true'], falsy: ['false'] }).default(false),
  // only that country's Clicks, in the Click list
  country: ClickCountrySchema.optional(),
  // the server's cursor of the next page, sent back as it came
  cursor: ClickCursorSchema.optional(),
  // the id of the last saved Click shown, so only the Clicks saved after it
  // come back
  after: ClickIdSchema.optional()
});
