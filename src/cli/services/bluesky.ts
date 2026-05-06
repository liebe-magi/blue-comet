import { AtpAgent } from '@atproto/api';
import { buildBlueskyPostUrl } from '../../core/uri';
import type { StoredCredentials } from './credentials';

export interface PostResult {
  uri: string;
  cid: string;
  webUrl: string;
}

export interface BlueskyClient {
  post(text: string, options?: { langs?: string[] }): Promise<PostResult>;
  did: string;
  handle: string;
}

export async function createBlueskyClient(credentials: StoredCredentials): Promise<BlueskyClient> {
  const agent = new AtpAgent({ service: credentials.service });
  await agent.login({ identifier: credentials.handle, password: credentials.appPassword });

  const session = agent.session;
  if (!session) {
    throw new Error('Bluesky login succeeded but session is missing');
  }

  return {
    did: session.did,
    handle: session.handle,
    async post(text, options = {}) {
      const response = await agent.post({
        text,
        langs: options.langs ?? ['en'],
        createdAt: new Date().toISOString(),
      });
      return {
        uri: response.uri,
        cid: response.cid,
        webUrl: buildBlueskyPostUrl(response.uri, session.handle),
      };
    },
  };
}

export async function verifyCredentials(credentials: StoredCredentials): Promise<{
  did: string;
  handle: string;
}> {
  const agent = new AtpAgent({ service: credentials.service });
  await agent.login({ identifier: credentials.handle, password: credentials.appPassword });
  const session = agent.session;
  if (!session) {
    throw new Error('Login succeeded but session is missing');
  }
  return { did: session.did, handle: session.handle };
}
