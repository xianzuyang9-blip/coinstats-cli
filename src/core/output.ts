export type OutputOptions = {
  pretty?: boolean;
  table?: boolean;
  format?: 'json' | 'csv';
  fields?: string;
};

type OutputEnvelope =
  | { success: true; data: unknown }
  | { success: false; error: string; code: string; status?: number };

export function formatSuccess<T>(data: T) {
  return { success: true, data } as const;
}

export function formatError(
  error: string,
  code = 'REQUEST_FAILED',
  status?: number,
) {
  return { success: false, error, code, status } as const;
}

function getByPath(input: unknown, path: string) {
  const parts = path.split('.');
  let current = input;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function pickFields(input: unknown, fields: string[]): unknown {
  if (Array.isArray(input)) {
    return input.map((item) => pickFields(item, fields));
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  const output: Record<string, unknown> = {};

  for (const field of fields) {
    output[field] = getByPath(input, field);
  }

  return output;
}

function escapeCsv(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  const text =
    typeof value === 'object' ? JSON.stringify(value) : String(value);

  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function toCsv(data: unknown) {
  const rows = Array.isArray(data) ? data : [data];
  const records = rows.filter(
    (row): row is Record<string, unknown> =>
      Boolean(row) && typeof row === 'object' && !Array.isArray(row),
  );

  if (records.length === 0) {
    return '';
  }

  const columns = [...new Set(records.flatMap((row) => Object.keys(row)))];
  const lines = [columns.join(',')];

  for (const record of records) {
    lines.push(columns.map((column) => escapeCsv(record[column])).join(','));
  }

  return lines.join('\n');
}

function toTable(data: unknown) {
  const rows = Array.isArray(data) ? data : [data];
  const records = rows.filter(
    (row): row is Record<string, unknown> =>
      Boolean(row) && typeof row === 'object' && !Array.isArray(row),
  );

  if (records.length === 0) {
    return JSON.stringify(data, null, 2);
  }

  const columns = [...new Set(records.flatMap((row) => Object.keys(row)))].slice(
    0,
    8,
  );
  const widths = columns.map((column) => {
    const longestValue = Math.max(
      column.length,
      ...records.map((row) =>
        String(row[column] ?? '').slice(0, 40).length,
      ),
    );
    return Math.min(longestValue, 40);
  });

  const header = columns
    .map((column, index) => column.padEnd(widths[index]))
    .join(' | ');
  const divider = widths.map((width) => '-'.repeat(width)).join('-|-');
  const body = records.map((row) =>
    columns
      .map((column, index) =>
        String(row[column] ?? '')
          .slice(0, widths[index])
          .padEnd(widths[index]),
      )
      .join(' | '),
  );

  return [header, divider, ...body].join('\n');
}

export function formatOutput(
  envelope: OutputEnvelope,
  options: OutputOptions = {},
) {
  const fields = options.fields
    ?.split(',')
    .map((field) => field.trim())
    .filter(Boolean);

  if (envelope.success) {
    const data = fields?.length ? pickFields(envelope.data, fields) : envelope.data;

    if (options.format === 'csv') {
      return toCsv(data) + '\n';
    }

    if (options.table) {
      return toTable(data) + '\n';
    }

    return (
      JSON.stringify(
        formatSuccess(data),
        null,
        options.pretty ? 2 : undefined,
      ) + '\n'
    );
  }

  return (
    JSON.stringify(envelope, null, options.pretty ? 2 : undefined) + '\n'
  );
}
