import { COMMANDS } from '../dist/src/registry/commands.js';
import { getAllOpenApiOperations } from '../dist/src/core/openapi.js';

const openApiOperations = getAllOpenApiOperations().map(
  (operation) => `${operation.method} ${operation.path} ${operation.operationId}`,
);

const commandOperations = COMMANDS.map((command) => {
  const operation = getAllOpenApiOperations().find(
    (item) => item.operationId === command.operationId,
  );

  if (!operation) {
    throw new Error(`Missing OpenAPI operation for ${command.operationId}`);
  }

  return `${operation.method} ${operation.path} ${operation.operationId}`;
});

const missing = openApiOperations.filter(
  (operation) => !commandOperations.includes(operation),
);
const duplicates = commandOperations.filter(
  (operation, index) => commandOperations.indexOf(operation) !== index,
);

if (missing.length || duplicates.length) {
  if (missing.length) {
    console.error('Missing operations:');
    for (const operation of missing) {
      console.error(`  ${operation}`);
    }
  }

  if (duplicates.length) {
    console.error('Duplicate mappings:');
    for (const operation of duplicates) {
      console.error(`  ${operation}`);
    }
  }

  process.exit(1);
}

console.log(`Coverage OK: ${commandOperations.length}/${openApiOperations.length} operations mapped`);
