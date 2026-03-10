import { describe, expect, it } from 'vitest';
import { runCli } from '../../src/cli.js';

describe('schema command', () => {
  it('prints registry-derived schema', async () => {
    const result = await runCli(['schema', '--pretty']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('get-coins');
    expect(result.stdout).toContain('coins');
    expect(result.stdout).toContain('fear-and-greed-chart');
  });
});
