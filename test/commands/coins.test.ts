import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCli } from '../../src/cli.js';

describe('coins commands', () => {
  beforeEach(() => {
    process.env.COINSTATS_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.COINSTATS_API_KEY;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('executes coins list through the CoinStats sdk wrapper', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ result: [{ id: 'bitcoin' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await runCli(['coins', 'list']);
    const payload = JSON.parse(result.stdout);

    expect(result.exitCode).toBe(0);
    expect(payload.success).toBe(true);
    expect(JSON.stringify(payload.data)).toContain('bitcoin');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
