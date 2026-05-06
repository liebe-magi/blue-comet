import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export interface BlueCometConfig {
  files?: string[];
  frontmatterKey?: string;
  textTemplate?: string;
  concurrency?: number;
  service?: string;
  language?: string;
}

const CONFIG_FILENAMES = ['bluecomet.config.json', 'bluecomet.config.mjs', 'bluecomet.config.js'];

export async function loadConfig(cwd: string = process.cwd()): Promise<BlueCometConfig> {
  for (const name of CONFIG_FILENAMES) {
    const path = resolve(cwd, name);
    if (!existsSync(path)) continue;
    if (path.endsWith('.json')) {
      try {
        const raw = readFileSync(path, 'utf8');
        return validate(JSON.parse(raw));
      } catch (cause) {
        throw new Error(`Failed to parse ${name}`, { cause });
      }
    }
    try {
      const mod = (await import(pathToFileURL(path).href)) as {
        default?: BlueCometConfig;
      } & BlueCometConfig;
      const config = mod.default ?? mod;
      return validate(config);
    } catch (cause) {
      throw new Error(`Failed to load ${name}`, { cause });
    }
  }
  return {};
}

export async function loadConfigFromExplicitPath(path: string): Promise<BlueCometConfig> {
  const absolute = resolve(process.cwd(), path);
  if (!existsSync(absolute)) {
    throw new Error(`Config file not found: ${path}`);
  }
  if (absolute.endsWith('.json')) {
    return validate(JSON.parse(readFileSync(absolute, 'utf8')));
  }
  const mod = (await import(pathToFileURL(absolute).href)) as {
    default?: BlueCometConfig;
  } & BlueCometConfig;
  return validate(mod.default ?? mod);
}

function validate(value: unknown): BlueCometConfig {
  if (!value || typeof value !== 'object') {
    throw new Error('Config must export an object');
  }
  const obj = value as Record<string, unknown>;
  const config: BlueCometConfig = {};
  if (Array.isArray(obj.files)) {
    config.files = obj.files.filter((entry): entry is string => typeof entry === 'string');
  }
  if (typeof obj.frontmatterKey === 'string') config.frontmatterKey = obj.frontmatterKey;
  if (typeof obj.textTemplate === 'string') config.textTemplate = obj.textTemplate;
  if (typeof obj.concurrency === 'number') config.concurrency = obj.concurrency;
  if (typeof obj.service === 'string') config.service = obj.service;
  if (typeof obj.language === 'string') config.language = obj.language;
  return config;
}
