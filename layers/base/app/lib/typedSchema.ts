import type { TypedSchema } from 'vee-validate';
import type { z } from 'zod';

// vee-validate's path syntax: items[0].name
const toFormPath = (path: PropertyKey[]) =>
  path.reduce<string>((formPath, key) => {
    if (typeof key === 'number') return `${formPath}[${key}]`;

    return formPath ? `${formPath}.${String(key)}` : String(key);
  }, '');

// @vee-validate/zod only supports zod 3. This has no vee-validate cast hook, so
// schema defaults don't fill a form's initial values
export const toTypedSchema = <Schema extends z.ZodType>(
  schema: Schema,
  error: z.core.$ZodErrorMap
): TypedSchema<z.input<Schema>, z.output<Schema>> => ({
  __type: 'VVTypedSchema',

  parse: async (values) => {
    const result = await schema.safeParseAsync(values, { error });

    if (result.success) return { value: result.data, errors: [] };

    const errors = new Map<string, string[]>();

    for (const { path, message } of result.error.issues) {
      const formPath = toFormPath(path);

      errors.set(formPath, [...(errors.get(formPath) ?? []), message]);
    }

    return {
      errors: [...errors].map(([path, messages]) => ({
        path,
        errors: messages
      }))
    };
  }
});
