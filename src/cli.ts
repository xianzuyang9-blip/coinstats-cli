import { Command, CommanderError } from 'commander';
import { readFile } from 'node:fs/promises';
import {
  clearConfig,
  loadSavedConfig,
  maskApiKey,
  resolveApiKey,
  resolveBaseUrl,
  saveConfig,
} from './core/config.js';
import {
  coerceValue,
  getAllOpenApiOperations,
  getOperationById,
  getOperationParameters,
  operationBodyIsRequired,
  operationRequiresAuth,
  operationRequiresBody,
  toKebabCase,
  toOptionKey,
} from './core/openapi.js';
import {
  formatError,
  formatOutput,
  formatSuccess,
  type OutputOptions,
} from './core/output.js';
import { invokeOperation } from './core/sdk.js';
import {
  COMMANDS,
  COMMANDS_BY_SECTION,
  SECTION_DESCRIPTIONS,
  type CommandDefinition,
} from './registry/commands.js';

type CliState = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

export type CliResult = CliState;

type CommandRuntimeOptions = OutputOptions & {
  body?: string;
  bodyFile?: string;
  yes?: boolean;
};

function writeStdout(state: CliState, text: string) {
  state.stdout += text;
}

function writeStderr(state: CliState, text: string) {
  state.stderr += text;
}

function setExitCode(state: CliState, code: number) {
  state.exitCode = Math.max(state.exitCode, code);
}

async function loadBody(options: CommandRuntimeOptions) {
  if (options.bodyFile) {
    const raw = await readFile(options.bodyFile, 'utf8');
    return JSON.parse(raw);
  }

  if (options.body) {
    return JSON.parse(options.body);
  }

  return undefined;
}

function buildSchemaPayload() {
  return {
    commands: COMMANDS.map((command) => {
      const operation = getOperationById(command.operationId);
      return {
        section: command.section,
        command: command.command,
        operationId: command.operationId,
        method: operation.method,
        path: operation.path,
        mutable: Boolean(command.mutable),
        parameters: getOperationParameters(command.operationId).map((parameter) => ({
          name: parameter.name,
          in: parameter.in,
          required: Boolean(parameter.required),
          type: parameter.schema?.type ?? 'string',
          description: parameter.description ?? '',
        })),
        requestBody: operationRequiresBody(command.operationId)
          ? {
              required: operationBodyIsRequired(command.operationId),
            }
          : null,
      };
    }),
  };
}

async function runApiCommand(
  definition: CommandDefinition,
  rawOptions: Record<string, unknown>,
): Promise<ReturnType<typeof formatSuccess> | ReturnType<typeof formatError>> {
  if (definition.mutable && rawOptions.yes !== true) {
    return formatError(
      'This command changes remote state. Re-run with --yes to confirm.',
      'CONFIRMATION_REQUIRED',
      400,
    );
  }

  const savedConfig = await loadSavedConfig();
  const apiKey = resolveApiKey({ savedKey: savedConfig.apiKey });

  if (operationRequiresAuth(definition.operationId) && !apiKey) {
    return formatError(
      'Missing CoinStats API key. Set COINSTATS_API_KEY or run: coinstats login --api-key <key>',
      'UNAUTHORIZED',
      401,
    );
  }

  const parameters = getOperationParameters(definition.operationId);
  const pathParams: Record<string, unknown> = {};
  const queryParams: Record<string, unknown> = {};

  for (const parameter of parameters) {
    const optionKey = toOptionKey(parameter.name);
    const rawValue = rawOptions[optionKey];

    if (rawValue === undefined) {
      if (parameter.required) {
        return formatError(
          `Missing required option --${toKebabCase(parameter.name)}`,
          'MISSING_REQUIRED_OPTION',
          400,
        );
      }

      continue;
    }

    const value = coerceValue(parameter.schema, rawValue);

    if (parameter.in === 'path') {
      pathParams[parameter.name] = value;
    } else if (parameter.in === 'query') {
      queryParams[parameter.name] = value;
    }
  }

  let body: unknown;

  try {
    body = await loadBody(rawOptions as CommandRuntimeOptions);
  } catch (error) {
    return formatError(
      error instanceof Error ? error.message : 'Invalid JSON body',
      'INVALID_BODY',
      400,
    );
  }

  if (operationBodyIsRequired(definition.operationId) && body === undefined) {
    return formatError(
      'This operation requires a JSON request body. Use --body or --body-file.',
      'MISSING_BODY',
      400,
    );
  }

  try {
    const result = await invokeOperation(definition.operationId, {
      apiKey: apiKey ?? '',
      baseUrl: resolveBaseUrl(savedConfig),
      ...(Object.keys(pathParams).length ? { path: pathParams } : {}),
      ...(Object.keys(queryParams).length ? { query: queryParams } : {}),
      ...(body !== undefined ? { body } : {}),
    });

    if (result && typeof result === 'object' && 'error' in result && result.error) {
      const responseStatus =
        'response' in result &&
        result.response &&
        typeof result.response === 'object' &&
        'status' in result.response
          ? Number(result.response.status)
          : undefined;

      const message =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);

      return formatError(message, 'REQUEST_FAILED', responseStatus);
    }

    if (result && typeof result === 'object' && 'data' in result) {
      return formatSuccess(result.data);
    }

    return formatSuccess(result);
  } catch (error) {
    return formatError(
      error instanceof Error ? error.message : 'Request failed',
      'REQUEST_FAILED',
    );
  }
}

function addCommonOptions(command: Command, operationId: string, mutable: boolean) {
  command.option('--pretty', 'Pretty-print JSON output');
  command.option('--table', 'Render tabular data as a table');
  command.option('--format <format>', 'Output format: json or csv', 'json');
  command.option('--fields <fields>', 'Comma-separated fields to include');

  for (const parameter of getOperationParameters(operationId)) {
    const optionName = `--${toKebabCase(parameter.name)}`;
    const valueToken =
      parameter.schema?.type === 'boolean' ? '' : ' <value>';
    const descriptionParts = [parameter.description ?? ''];
    if (parameter.required) {
      descriptionParts.push('(required)');
    }
    if (parameter.schema?.type === 'array') {
      descriptionParts.push('(comma-separated)');
    }

    command.option(
      `${optionName}${valueToken}`,
      descriptionParts.filter(Boolean).join(' '),
    );
  }

  if (operationRequiresBody(operationId)) {
    command.option('--body <json>', 'Inline JSON request body');
    command.option('--body-file <path>', 'Path to a JSON request body file');
  }

  if (mutable) {
    command.option('--yes', 'Confirm remote mutation');
  }
}

function addSectionCommands(program: Command, state: CliState) {
  for (const [section, commands] of Object.entries(COMMANDS_BY_SECTION)) {
    const sectionCommand = program
      .command(section)
      .description(SECTION_DESCRIPTIONS[section] ?? `${section} commands`);

    for (const definition of commands) {
      const operation = getOperationById(definition.operationId);
      const command = sectionCommand
        .command(definition.command)
        .description(operation.operation.summary ?? definition.operationId);

      addCommonOptions(command, definition.operationId, Boolean(definition.mutable));

      command.action(async (options: Record<string, unknown>) => {
        const envelope = await runApiCommand(definition, options);
        const output = formatOutput(envelope, options as OutputOptions);

        if (envelope.success) {
          writeStdout(state, output);
        } else {
          writeStderr(state, output);
          setExitCode(state, 1);
        }
      });
    }
  }
}

function buildProgram(state: CliState) {
  const program = new Command();

  program
    .name('coinstats')
    .description('Command-line interface for the CoinStats Public API')
    .showHelpAfterError()
    .helpOption('-h, --help', 'Display help for command')
    .configureOutput({
      writeOut: (text) => writeStdout(state, text),
      writeErr: (text) => writeStderr(state, text),
    })
    .exitOverride();

  program
    .command('login')
    .description('Save a CoinStats API key to local config')
    .requiredOption('--api-key <key>', 'CoinStats API key')
    .option('--base-url <url>', 'Override the CoinStats API base URL')
    .action(async (options: { apiKey: string; baseUrl?: string }) => {
      await saveConfig({ apiKey: options.apiKey, baseUrl: options.baseUrl });
      writeStdout(state, 'Saved CoinStats credentials to ~/.coinstats/config.json\n');
    });

  program
    .command('logout')
    .description('Remove locally saved CoinStats credentials')
    .action(async () => {
      await clearConfig();
      writeStdout(state, 'Removed ~/.coinstats/config.json\n');
    });

  program
    .command('whoami')
    .description('Show the resolved CoinStats auth source')
    .action(async () => {
      const savedConfig = await loadSavedConfig();
      const envKey = process.env.COINSTATS_API_KEY;
      const apiKey = resolveApiKey({ savedKey: savedConfig.apiKey });
      const source = envKey ? 'COINSTATS_API_KEY' : savedConfig.apiKey ? 'saved config' : 'missing';

      writeStdout(
        state,
        JSON.stringify(
          {
            source,
            apiKey: maskApiKey(apiKey),
            baseUrl: resolveBaseUrl(savedConfig),
          },
          null,
          2,
        ) + '\n',
      );
    });

  program
    .command('schema')
    .description('Print the CLI command schema derived from the operation registry')
    .option('--pretty', 'Pretty-print the schema output')
    .action((options: { pretty?: boolean }) => {
      writeStdout(
        state,
        JSON.stringify(
          {
            operations: getAllOpenApiOperations().length,
            ...buildSchemaPayload(),
          },
          null,
          options.pretty ? 2 : undefined,
        ) + '\n',
      );
    });

  addSectionCommands(program, state);

  return program;
}

export async function runCli(args: string[]): Promise<CliResult> {
  const state: CliState = { exitCode: 0, stdout: '', stderr: '' };
  const program = buildProgram(state);

  try {
    await program.parseAsync(args, { from: 'user' });
    return state;
  } catch (error) {
    if (
      error instanceof CommanderError &&
      error.code === 'commander.helpDisplayed'
    ) {
      return state;
    }

    setExitCode(
      state,
      error && typeof error === 'object' && 'exitCode' in error
        ? Number(error.exitCode)
        : 1,
    );

    return state;
  }
}
