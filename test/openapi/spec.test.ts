import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const spec = JSON.parse(
  readFileSync(
    new URL('../../openapi/coinstats-public-api.json', import.meta.url),
    'utf8',
  ),
) as {
  paths: Record<string, Record<string, { operationId: string }>>;
};

describe('openapi snapshot', () => {
  it('contains the published CoinStats operations', () => {
    expect(Object.keys(spec.paths)).toHaveLength(51);
    expect(spec.paths['/coins'].get.operationId).toBe('get-coins');
    expect(spec.paths['/portfolio/sync'].patch.operationId).toBe('sync-portfolio');
  });
});
