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
    expect(payload.error).toContain('coinstats login --api-key <key>');
    expect(payload.error).toContain('COINSTATS_API_KEY');
  });

  it('includes signup guidance in whoami when auth is missing', async () => {
    const { runCli } = await loadCliWithoutSavedConfig();

    const result = await runCli(['whoami']);
    const payload = JSON.parse(result.stdout);

    expect(result.exitCode).toBe(0);
    expect(payload.source).toBe('missing');
    expect(payload.authHelp.signupUrl).toBe('https://openapi.coinstats.app');
    expect(payload.authHelp.loginCommand).toBe('coinstats login --api-key <key>');
    expect(payload.authHelp.envVar).toBe('COINSTATS_API_KEY');
  });
});
