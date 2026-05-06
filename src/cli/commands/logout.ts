import { clearCredentials, loadCredentials } from '../services/credentials';
import { log } from '../util/logger';

export async function runLogout(): Promise<void> {
  const existing = loadCredentials();
  clearCredentials();
  if (existing) {
    log.success(`Cleared credentials for @${existing.handle}`);
  } else {
    log.info('No stored credentials.');
  }
}
