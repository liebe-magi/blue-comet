import { homedir } from 'node:os';
import { join } from 'node:path';

const CONFIG_DIR_NAME = '.bluecomet';
const CREDENTIALS_FILENAME = 'credentials.json';

export function getConfigDir(): string {
  // Honor an explicit override for testing or CI sandboxes.
  const override = process.env.BLUECOMET_CONFIG_DIR;
  if (override) return override;
  return join(homedir(), CONFIG_DIR_NAME);
}

export function getCredentialsPath(): string {
  return join(getConfigDir(), CREDENTIALS_FILENAME);
}
