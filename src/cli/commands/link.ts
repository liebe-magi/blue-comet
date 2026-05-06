import { loadCredentials } from '../services/credentials';
import { createBlueskyClient } from '../services/bluesky';
import type { BlueskyClient } from '../services/bluesky';
import { readFrontmatter, writeFrontmatter } from '../services/frontmatter';
import { renderTemplate } from '../services/template';
import { loadConfig, loadConfigFromExplicitPath } from '../config';
import type { BlueCometConfig } from '../config';
import { log } from '../util/logger';
import kleur from 'kleur';

export interface LinkOptions {
  textTemplate?: string;
  frontmatterKey?: string;
  dryRun?: boolean;
  skipExisting?: boolean;
  force?: boolean;
  configPath?: string;
  concurrency?: number;
  language?: string;
}

export interface LinkReportEntry {
  path: string;
  status: 'posted' | 'skipped' | 'error';
  uri?: string;
  message?: string;
}

export interface LinkReport {
  entries: LinkReportEntry[];
}

const DEFAULT_TEMPLATE = '{{title}}\n\n{{description}}';
const DEFAULT_KEY = 'bluesky';

export async function runLink(files: string[], options: LinkOptions = {}): Promise<LinkReport> {
  const config = options.configPath
    ? await loadConfigFromExplicitPath(options.configPath)
    : await loadConfig();

  const merged = mergeOptions(config, options);

  if (files.length === 0 && config.files) {
    files = config.files;
  }
  if (files.length === 0) {
    throw new Error(
      'No files provided. Pass paths as arguments or set `files` in bluecomet.config.json.'
    );
  }

  if (merged.skipExisting && merged.force) {
    throw new Error('--force and --skip-existing are mutually exclusive');
  }

  let client: BlueskyClient | null = null;
  if (!merged.dryRun) {
    const credentials = loadCredentials();
    if (!credentials) {
      throw new Error('Not logged in. Run `bluecomet login` first.');
    }
    client = await createBlueskyClient(credentials);
  }

  const entries: LinkReportEntry[] = [];

  for (const path of files) {
    try {
      const file = readFrontmatter(path);
      const existing = file.data[merged.frontmatterKey];

      if (existing && merged.skipExisting && !merged.force) {
        log.dim(`${kleur.gray('-')} ${path} ${kleur.gray('(already linked)')}`);
        entries.push({
          path,
          status: 'skipped',
          uri: typeof existing === 'string' ? existing : undefined,
        });
        continue;
      }

      const text = renderTemplate({
        template: merged.textTemplate,
        filePath: path,
        data: file.data,
      });

      if (merged.dryRun) {
        log.info(`${kleur.cyan('dry-run')} ${path}`);
        log.dim(indent(text));
        entries.push({ path, status: 'skipped', message: 'dry-run' });
        continue;
      }

      const result = await client!.post(text, {
        langs: merged.language ? [merged.language] : undefined,
      });
      writeFrontmatter(file, { [merged.frontmatterKey]: result.uri });
      log.success(`${path} → ${result.uri}`);
      entries.push({ path, status: 'posted', uri: result.uri });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`${path}: ${message}`);
      entries.push({ path, status: 'error', message });
    }
  }

  return { entries };
}

interface ResolvedOptions {
  textTemplate: string;
  frontmatterKey: string;
  dryRun: boolean;
  skipExisting: boolean;
  force: boolean;
  language: string | undefined;
}

function mergeOptions(config: BlueCometConfig, options: LinkOptions): ResolvedOptions {
  return {
    textTemplate: options.textTemplate ?? config.textTemplate ?? DEFAULT_TEMPLATE,
    frontmatterKey: options.frontmatterKey ?? config.frontmatterKey ?? DEFAULT_KEY,
    dryRun: options.dryRun ?? false,
    skipExisting: options.skipExisting ?? !options.force,
    force: options.force ?? false,
    language: options.language ?? config.language,
  };
}

function indent(text: string, prefix: string = '    '): string {
  return text
    .split('\n')
    .map(line => prefix + line)
    .join('\n');
}
