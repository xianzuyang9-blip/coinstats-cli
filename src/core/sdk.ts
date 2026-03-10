import * as generatedSdk from '../generated/index.js';
import { createClient } from '../generated/client/index.js';

export function toSdkFunctionName(operationId: string) {
  return operationId.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

export function buildSdkClient(apiKey: string, baseUrl: string) {
  return createClient({
    auth: apiKey,
    baseUrl,
    responseStyle: 'fields',
    throwOnError: false,
  });
}

export async function invokeOperation(
  operationId: string,
  input: {
    apiKey: string;
    baseUrl: string;
    path?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: unknown;
  },
) {
  const functionName = toSdkFunctionName(operationId);
  const sdkFunction = (generatedSdk as Record<string, unknown>)[functionName];

  if (typeof sdkFunction !== 'function') {
    throw new Error(
      `No generated SDK function found for operationId "${operationId}"`,
    );
  }

  const client = buildSdkClient(input.apiKey, input.baseUrl);

  return sdkFunction({
    client,
    ...(input.path && Object.keys(input.path).length ? { path: input.path } : {}),
    ...(input.query && Object.keys(input.query).length
      ? { query: input.query }
      : {}),
    ...(input.body !== undefined ? { body: input.body } : {}),
  });
}
