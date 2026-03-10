import { afterEach, describe, expect, it } from 'vitest';
import { maskApiKey, resolveApiKey } from '../../src/core/config.js';

describe('config helpers', () => {
  afterEach(() => {
    delete process.env.COINSTATS_API_KEY;
  });

  it('prefers COINSTATS_API_KEY over saved config', () => {
    process.env.COINSTATS_API_KEY = 'env-key';

    expect(resolveApiKey({ savedKey: 'saved-key' })).toBe('env-key');
  });

  it('masks api keys for display', () => {
    expect(maskApiKey('abcd1234efgh5678')).toBe('abcd****5678');
  });
});
