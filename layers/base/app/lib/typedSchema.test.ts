import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { toTypedSchema } from './typedSchema';

const typedSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .trim()
      .min(3)
      .regex(/^[a-z]+$/),
    tags: z.array(z.object({ label: z.string().min(1) }))
  }),
  ({ code }) => `failed ${code}`
);

describe('toTypedSchema', () => {
  it('returns the parsed value when the input is valid', async () => {
    expect(await typedSchema.parse({ name: ' abc ', tags: [] })).toEqual({
      value: { name: 'abc', tags: [] },
      errors: []
    });
  });

  it('groups the error map messages by field', async () => {
    const { value, errors } = await typedSchema.parse({ name: 'A', tags: [] });

    expect(value).toBeUndefined();
    expect(errors).toEqual([
      { path: 'name', errors: ['failed too_small', 'failed invalid_format'] }
    ]);
  });

  it('uses the vee-validate path of nested fields', async () => {
    const { errors } = await typedSchema.parse({
      name: 'abc',
      tags: [{ label: 'ok' }, { label: '' }]
    });

    expect(errors).toEqual([
      { path: 'tags[1].label', errors: ['failed too_small'] }
    ]);
  });
});
