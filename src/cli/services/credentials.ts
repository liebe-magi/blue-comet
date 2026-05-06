import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { getCredentialsPath } from '../util/paths';

export interface StoredCredentials {
  handle: string;
  appPassword: string;
  did?: string;
  service: string;
}

export function loadCredentials(): StoredCredentials | null {
  const path = getCredentialsPath();
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredCredentials>;
    if (!parsed.handle || !parsed.appPassword) return null;
    return {
      handle: parsed.handle,
      appPassword: parsed.appPassword,
      did: parsed.did,
      service: parsed.service ?? 'https://bsky.social',
    };
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: StoredCredentials): void {
  const path = getCredentialsPath();
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
  writeFileSync(path, JSON.stringify(credentials, null, 2) + '\n', { mode: 0o600 });
  // writeFileSync's mode is only honored on file creation; chmod for existing files.
  chmodSync(path, 0o600);
}

export function clearCredentials(): void {
  const path = getCredentialsPath();
  if (existsSync(path)) {
    rmSync(path);
  }
}
