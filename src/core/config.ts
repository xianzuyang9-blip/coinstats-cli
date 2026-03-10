import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export type SavedConfig = {
  apiKey?: string;
  baseUrl?: string;
};

export const DEFAULT_BASE_URL = 'https://openapiv1.coinstats.app';
export const CONFIG_DIR = path.join(os.homedir(), '.coinstats');
export const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export function resolveApiKey(input: { savedKey?: string | null }) {
  return process.env.COINSTATS_API_KEY || input.savedKey || null;
}

export function maskApiKey(value: string | null) {
  if (!value) {
    return '(missing)';
  }

  if (value.length <= 8) {
    return '****';
  }

  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

export async function loadSavedConfig(): Promise<SavedConfig> {
  try {
    const raw = await readFile(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as SavedConfig;
    return parsed;
  } catch {
    return {};
  }
}

export async function saveConfig(config: SavedConfig) {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

export async function clearConfig() {
  await rm(CONFIG_PATH, { force: true });
}

export function resolveBaseUrl(savedConfig: SavedConfig) {
  return process.env.COINSTATS_BASE_URL || savedConfig.baseUrl || DEFAULT_BASE_URL;
}
