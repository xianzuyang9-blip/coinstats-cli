import { readFileSync } from 'node:fs';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type OpenApiSchema = {
  type?: string;
  enum?: unknown[];
  items?: OpenApiSchema;
  default?: unknown;
};

export type OpenApiParameter = {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
};

export type OpenApiRequestBody = {
  required?: boolean;
  content?: Record<string, { schema?: OpenApiSchema }>;
};

export type OpenApiOperation = {
  operationId: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  security?: unknown[];
};

type OpenApiPathItem = Partial<Record<Lowercase<HttpMethod>, OpenApiOperation>>;

type OpenApiSpec = {
  paths: Record<string, OpenApiPathItem>;
};

export const openApiSpec = JSON.parse(
  readFileSync(
    new URL('../../openapi/coinstats-public-api.json', import.meta.url),
    'utf8',
  ),
) as OpenApiSpec;

const operationsById = new Map<
  string,
  { method: HttpMethod; path: string; operation: OpenApiOperation }
>();

for (const [path, pathItem] of Object.entries(openApiSpec.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!operation?.operationId) {
      continue;
    }

    operationsById.set(operation.operationId, {
      method: method.toUpperCase() as HttpMethod,
      path,
      operation,
    });
  }
}

export function getOperationById(operationId: string) {
  const operation = operationsById.get(operationId);

  if (!operation) {
    throw new Error(`Unknown OpenAPI operationId: ${operationId}`);
  }

  return operation;
}

export function getAllOpenApiOperations() {
  return [...operationsById.values()].map((entry) => ({
    operationId: entry.operation.operationId,
    method: entry.method,
    path: entry.path,
    tags: entry.operation.tags ?? [],
  }));
}

export function getOperationParameters(operationId: string) {
  return getOperationById(operationId).operation.parameters ?? [];
}

export function operationRequiresBody(operationId: string) {
  return Boolean(getOperationById(operationId).operation.requestBody);
}

export function operationBodyIsRequired(operationId: string) {
  return Boolean(getOperationById(operationId).operation.requestBody?.required);
}

export function operationRequiresAuth(operationId: string) {
  return Boolean(getOperationById(operationId).operation.security?.length);
}

export function toKebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

export function toOptionKey(value: string) {
  const normalized = toKebabCase(value);
  return normalized.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

export function coerceValue(
  schema: OpenApiSchema | undefined,
  rawValue: unknown,
): unknown {
  if (rawValue === undefined) {
    return undefined;
  }

  if (!schema) {
    return rawValue;
  }

  if (schema.type === 'boolean') {
    if (typeof rawValue === 'boolean') {
      return rawValue;
    }

    if (rawValue === 'true') {
      return true;
    }

    if (rawValue === 'false') {
      return false;
    }
  }

  if (schema.type === 'integer' || schema.type === 'number') {
    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? rawValue : parsed;
  }

  if (schema.type === 'array' && typeof rawValue === 'string') {
    return rawValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => coerceValue(schema.items, item));
  }

  return rawValue;
}
