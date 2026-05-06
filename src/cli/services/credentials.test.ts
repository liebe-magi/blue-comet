import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearCredentials, loadCredentials, saveCredentials } from './credentials';

let tempDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'bluecomet-creds-'));
  process.env.BLUECOMET_CONFIG_DIR = tempDir;
});

afterEach(() => {
  delete process.env.BLUECOMET_CONFIG_DIR;
  rmSync(tempDir, { recursive: true, force: true });
});

describe('credentials', () => {
  it('returns null when no credentials file exists', () => {
    expect(loadCredentials()).toBeNull();
  });

  it('round-trips saved credentials', () => {
    saveCredentials({
      handle: 'alice.bsky.social',
      appPassword: 'app-pass-1234',
      did: 'did:plc:abc123',
      service: 'https://bsky.social',
    });

    const loaded = loadCredentials();
    expect(loaded).toEqual({
      handle: 'alice.bsky.social',
      appPassword: 'app-pass-1234',
      did: 'did:plc:abc123',
      service: 'https://bsky.social',
    });
  });

  it('writes the credentials file with mode 0o600', () => {
    saveCredentials({
      handle: 'alice.bsky.social',
      appPassword: 'p',
      service: 'https://bsky.social',
    });

    const path = join(tempDir, 'credentials.json');
    const mode = statSync(path).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it('clears the credentials file', () => {
    saveCredentials({
      handle: 'a',
      appPassword: 'b',
      service: 'https://bsky.social',
    });
    expect(loadCredentials()).not.toBeNull();
    clearCredentials();
    expect(loadCredentials()).toBeNull();
  });

  it('returns null for malformed credential JSON', async () => {
    saveCredentials({
      handle: 'a',
      appPassword: 'b',
      service: 'https://bsky.social',
    });

    // Manually corrupt the file by writing invalid JSON.
    const fs = await import('node:fs');
    fs.writeFileSync(join(tempDir, 'credentials.json'), '{ not json');

    expect(loadCredentials()).toBeNull();
  });
});
