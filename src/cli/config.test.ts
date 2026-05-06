import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig, loadConfigFromExplicitPath } from './config';

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'bluecomet-config-'));
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('loadConfig', () => {
  it('returns an empty object when no config file exists', async () => {
    expect(await loadConfig(tempDir)).toEqual({});
  });

  it('reads bluecomet.config.json', async () => {
    writeFileSync(
      join(tempDir, 'bluecomet.config.json'),
      JSON.stringify({
        files: ['posts/*.mdx'],
        frontmatterKey: 'bsky',
        textTemplate: '{{title}}',
        concurrency: 2,
      })
    );

    expect(await loadConfig(tempDir)).toEqual({
      files: ['posts/*.mdx'],
      frontmatterKey: 'bsky',
      textTemplate: '{{title}}',
      concurrency: 2,
    });
  });

  it('drops unknown keys', async () => {
    writeFileSync(
      join(tempDir, 'bluecomet.config.json'),
      JSON.stringify({ frontmatterKey: 'bsky', mystery: 'value' })
    );

    expect(await loadConfig(tempDir)).toEqual({ frontmatterKey: 'bsky' });
  });

  it('throws on malformed JSON', async () => {
    writeFileSync(join(tempDir, 'bluecomet.config.json'), '{ not json');
    await expect(loadConfig(tempDir)).rejects.toThrow(/Failed to parse/);
  });
});

describe('loadConfigFromExplicitPath', () => {
  it('throws when the path does not exist', async () => {
    await expect(loadConfigFromExplicitPath('/no/such/file.json')).rejects.toThrow(
      /Config file not found/
    );
  });
});
