import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint();

const lintImport = async (filePath: string, code: string) => {
  const [result] = await eslint.lintText(code, { filePath });

  return result!.messages
    .filter(({ ruleId }) => ruleId !== '@typescript-eslint/no-unused-vars')
    .map(({ message }) => message);
};

describe('layer boundaries', () => {
  it.each([
    "import config from '../../../../app/app.config';",
    "export * from '../../../../shared/types';",
    "const page = import('../../../../app/pages/index.vue');",
    "import { setupTestServer } from '../../../../server/testing/server';"
  ])('rejects a relative import into root: %s', async (code) => {
    const messages = await lintImport(
      'layers/auth/server/infrastructure/fixture.ts',
      code
    );

    expect(messages).toEqual([
      expect.stringContaining('Layers cannot import the root app')
    ]);
  });

  it('rejects a relative import into a higher layer', async () => {
    const messages = await lintImport(
      'layers/auth/server/infrastructure/fixture.ts',
      "import { LinkService } from '../../../links/server/application/link.service';"
    );

    expect(messages).toEqual([
      expect.stringContaining('this layer cannot import links')
    ]);
  });

  it('allows relative imports into the own layer and lower layers', async () => {
    const messages = await lintImport(
      'layers/auth/server/infrastructure/fixture.ts',
      [
        "import * as schema from './schema';",
        "import type { User } from '../../shared/domain/user.type';",
        "import { getDB } from '../../../base/server/platform/db';"
      ].join('\n')
    );

    expect(messages).toEqual([]);
  });

  it('allows a layer test to import the root test harness', async () => {
    const messages = await lintImport(
      'layers/auth/server/infrastructure/fixture.test.ts',
      "import { setupTestServer } from '../../../../server/testing/server';"
    );

    expect(messages).toEqual([]);
  });
});
