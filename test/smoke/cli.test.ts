import { describe, expect, it } from 'vitest';
import { runCli } from '../../src/cli.js';

describe('cli smoke', () => {
  it('prints top-level help', async () => {
    const result = await runCli(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('coinstats');
    expect(result.stdout).toContain('coins');
  });
});
