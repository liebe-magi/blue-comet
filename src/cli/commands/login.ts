import prompts from 'prompts';
import { saveCredentials, loadCredentials } from '../services/credentials';
import { verifyCredentials } from '../services/bluesky';
import { log } from '../util/logger';

export interface LoginInput {
  handle?: string;
  appPassword?: string;
  service?: string;
}

export async function runLogin(input: LoginInput = {}): Promise<void> {
  const existing = loadCredentials();

  let handle = input.handle;
  let appPassword = input.appPassword;
  const service = input.service ?? existing?.service ?? 'https://bsky.social';

  if (!handle) {
    const answer = await prompts({
      type: 'text',
      name: 'value',
      message: 'Bluesky handle (e.g. alice.bsky.social):',
      initial: existing?.handle,
      validate: (value: string) => (value.trim().length > 0 ? true : 'Handle is required'),
    });
    if (!answer.value) {
      throw new Error('Login cancelled');
    }
    handle = String(answer.value).trim();
  }

  if (!appPassword) {
    const answer = await prompts({
      type: 'invisible',
      name: 'value',
      message: 'App password (https://bsky.app/settings/app-passwords):',
      validate: (value: string) => (value.trim().length > 0 ? true : 'App password is required'),
    });
    if (!answer.value) {
      throw new Error('Login cancelled');
    }
    appPassword = String(answer.value);
  }

  log.info('Verifying credentials…');
  const session = await verifyCredentials({ handle, appPassword, service });

  saveCredentials({ handle: session.handle, appPassword, did: session.did, service });
  log.success(`Logged in as @${session.handle} (${session.did})`);
}
