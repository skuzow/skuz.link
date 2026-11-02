import type { z } from 'zod';

enum MinMax {
  MIN = 'least',
  MAX = 'most'
}

type Issue = z.core.$ZodRawIssue;

type IssueOverride<K extends Issue['code']> = (
  issue: Extract<Issue, { code: K }>,
  input: string
) => string | undefined;

export type IssueOverrides = {
  [K in Issue['code']]?: IssueOverride<K>;
};

export const useFormMessage = () => {
  const { t: $t } = useI18n();

  const requiredMessage = (input: string) =>
    `${$t(`form.${input}`)} ${$t('form.required')}.`;

  const minMessage = (input: string, value: number, characters?: boolean) =>
    minMaxMessage(input, MinMax.MIN, value, characters);

  const maxMessage = (input: string, value: number, characters?: boolean) =>
    minMaxMessage(input, MinMax.MAX, value, characters);

  const minMaxMessage = (
    input: string,
    type: MinMax,
    value: number,
    characters: boolean = true
  ) =>
    `${$t(`form.${input}`)} ${$t(`form.${type}`)} ${value}${characters ? ` ${$t('form.characters')}` : ''}.`;

  const alreadyUseMessage = (input: string) =>
    `${$t(`form.${input}`)} ${$t('form.use')}.`;

  const formatMessage = (input: string, reason: string) =>
    `${$t(`form.${input}`)} ${$t(`form.${reason}`)}.`;

  const defaultMessage = (issue: Issue, input: string) => {
    switch (issue.code) {
      case 'invalid_type':
        return issue.input === undefined ? requiredMessage(input) : undefined;

      case 'too_small':
        return Number(issue.minimum) <= 1
          ? requiredMessage(input)
          : minMessage(input, Number(issue.minimum));

      case 'too_big':
        return maxMessage(input, Number(issue.maximum));
    }
  };

  const errorMap =
    (overrides: IssueOverrides = {}): z.core.$ZodErrorMap =>
    (issue) => {
      const input = issue.path?.[0] as string;
      const override = overrides[issue.code] as
        IssueOverride<typeof issue.code> | undefined;

      return override?.(issue, input) ?? defaultMessage(issue, input);
    };

  return {
    alreadyUseMessage,
    formatMessage,
    errorMap
  };
};
