import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadCliWithoutSavedConfig() {
  vi.resetModules();
  vi.doMock('../../src/core/config.js', async () => {
    const actual = await vi.importActual<typeof import('../../src/core/config.js')>(
      '../../src/core/config.js',
    );

    return {
      ...actual,
      loadSavedConfig: vi.fn(async () => ({})),
    };
  });

  return import('../../src/cli.js');
}

describe('auth guidance', () => {
  afterEach(() => {
    delete process.env.COINSTATS_API_KEY;
    delete process.env.COINSTATS_BASE_URL;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('shows signup guidance when an authenticated command runs without an API key', async () => {
    const { runCli } = await loadCliWithoutSavedConfig();

    const result = await runCli(['coins', 'list']);
    const payload = JSON.parse(result.stderr);

    expect(result.exitCode).toBe(1);
    expect(payload.code).toBe('UNAUTHORIZED');
    expect(payload.status).toBe(401);
    expect(payload.error).toContain('https://openapi.coinstats.app');
    expect(payload.error).toContain('export COINSTATS_API_KEY=<key>');
    expect(payload.error).toContain('coinstats login');
  });

  it('includes signup guidance in whoami when auth is missing', async () => {
    const { runCli } = await loadCliWithoutSavedConfig();

    const result = await runCli(['whoami']);
    const payload = JSON.parse(result.stdout);

    expect(result.exitCode).toBe(0);
    expect(payload.source).toBe('missing');
    expect(payload.authHelp.signupUrl).toBe('https://openapi.coinstats.app');
    expect(payload.authHelp.loginCommand).toBe('coinstats login');
    expect(payload.authHelp.exportCommand).toBe('export COINSTATS_API_KEY=<key>');
    expect(payload.authHelp.envVar).toBe('COINSTATS_API_KEY');
  });

  it('allows login to read the API key from COINSTATS_API_KEY', async () => {
    process.env.COINSTATS_API_KEY = 'env-api-key';

    const { runCli } = await import('../../src/cli.js');
    const result = await runCli(['login']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Saved CoinStats credentials');
  });
});
