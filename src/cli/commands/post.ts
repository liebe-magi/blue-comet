import { loadCredentials } from '../services/credentials';
import { createBlueskyClient } from '../services/bluesky';
import type { PostResult } from '../services/bluesky';
import { log } from '../util/logger';

export interface PostOptions {
  text?: string;
  stdin?: boolean;
  json?: boolean;
  lang?: string;
}

export async function runPost(options: PostOptions): Promise<PostResult> {
  const text = await resolveText(options);
  if (!text.trim()) {
    throw new Error('Post text is empty');
  }

  const credentials = loadCredentials();
  if (!credentials) {
    throw new Error('Not logged in. Run `bluecomet login` first.');
  }

  const client = await createBlueskyClient(credentials);
  const result = await client.post(text, { langs: options.lang ? [options.lang] : undefined });

  if (options.json) {
    process.stdout.write(JSON.stringify(result) + '\n');
  } else {
    log.success(`Posted to Bluesky:`);
    log.info(`  uri: ${result.uri}`);
    log.info(`  cid: ${result.cid}`);
    log.info(`  url: ${result.webUrl}`);
  }

  return result;
}

async function resolveText(options: PostOptions): Promise<string> {
  if (options.text && options.stdin) {
    throw new Error('Cannot combine --text and --stdin');
  }
  if (options.stdin) {
    return readStdin();
  }
  if (options.text) {
    return options.text;
  }
  throw new Error('Provide --text "..." or pipe text via --stdin');
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    throw new Error('No data available on stdin. Pipe text into the command.');
  }
  let data = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) {
    data += chunk as string;
  }
  return data.trimEnd();
}
