import { describe, expect, it } from 'vitest';
import { runCli } from '../../src/cli.js';

describe('mutation guards', () => {
  it('requires --yes for wallet sync-transactions', async () => {
    const result = await runCli([
      'wallet',
      'sync-transactions',
      '--blockchain',
      'ethereum',
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('--yes');
  });
});
