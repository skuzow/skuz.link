import type { FormInput } from '@/constants/form.constant';
import { z } from 'zod';

enum MinMax {
  MIN = 'least',
  MAX = 'most'
}

type IssueOverride<K extends z.ZodIssueCode> = (
  issue: Extract<z.ZodIssueOptionalMessage, { code: K }>,
  input: FormInput
) => string | undefined;

export type IssueOverrides = {
  [K in z.ZodIssueCode]?: IssueOverride<K>;
};

export const useFormMessage = () => {
  const { t: $t } = useI18n();

  const requiredMessage = (input: FormInput) =>
    `${$t(`form.${input}`)} ${$t('form.required')}.`;

  const minMessage = (input: FormInput, value: number, characters?: boolean) =>
    minMaxMessage(input, MinMax.MIN, value, characters);

  const maxMessage = (input: FormInput, value: number, characters?: boolean) =>
    minMaxMessage(input, MinMax.MAX, value, characters);

  const minMaxMessage = (
    input: FormInput,
    type: MinMax,
    value: number,
    characters: boolean = true
  ) =>
    `${$t(`form.${input}`)} ${$t(`form.${type}`)} ${value}${characters ? ` ${$t('form.characters')}` : ''}.`;

  const alreadyUseMessage = (input: FormInput) =>
    `${$t(`form.${input}`)} ${$t('form.use')}.`;

  const exampleMessage = (input: FormInput, number?: number) =>
    `${number || ''} ${$t('form.example')} ${$t(`form.${input}`)}`;

  const formatMessage = (input: FormInput, reason: string) =>
    `${$t(`form.${input}`)} ${$t(`form.${reason}`)}.`;

  const defaultMessage = (
    issue: z.ZodIssueOptionalMessage,
    input: FormInput
  ) => {
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        return issue.received === z.ZodParsedType.undefined
          ? requiredMessage(input)
          : undefined;

      case z.ZodIssueCode.too_small:
        return Number(issue.minimum) <= 1
          ? requiredMessage(input)
          : minMessage(input, Number(issue.minimum));

      case z.ZodIssueCode.too_big:
        return maxMessage(input, Number(issue.maximum));
    }
  };

  const errorMap =
    (overrides: IssueOverrides = {}): z.ZodErrorMap =>
    (issue, ctx) => {
      const input = issue.path[0] as FormInput;
      const override = overrides[issue.code] as
        IssueOverride<typeof issue.code> | undefined;

      const message = override?.(issue, input) ?? defaultMessage(issue, input);

      return { message: message ?? ctx.defaultError };
    };

  return {
    requiredMessage,
    minMessage,
    maxMessage,
    alreadyUseMessage,
    exampleMessage,
    formatMessage,
    errorMap
  };
};
