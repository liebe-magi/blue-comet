export interface AtUriParts {
  did: string;
  collection: string;
  rkey: string;
}

export interface BlueskyWebUrlParts {
  handle: string;
  rkey: string;
}

const AT_URI_RE = /^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/;
const WEB_URL_RE = /^https?:\/\/(?:bsky\.app|deer\.social)\/profile\/([^/]+)\/post\/([^/?#]+)/;
const DEFAULT_APPVIEW = 'https://public.api.bsky.app';

export function parseAtUri(uri: string): AtUriParts {
  const match = AT_URI_RE.exec(uri);
  if (!match) {
    throw new Error(`Invalid at:// URI: ${uri}`);
  }
  return {
    did: match[1]!,
    collection: match[2]!,
    rkey: match[3]!,
  };
}

export function buildBlueskyPostUrl(uri: string, handle?: string): string {
  const { did, rkey } = parseAtUri(uri);
  const identifier = handle ?? did;
  return `https://bsky.app/profile/${identifier}/post/${rkey}`;
}

export function buildReplyComposerUrl(uri: string, handle?: string): string {
  return buildBlueskyPostUrl(uri, handle);
}

export function parseBlueskyWebUrl(url: string): BlueskyWebUrlParts {
  const match = WEB_URL_RE.exec(url);
  if (!match) {
    throw new Error(`Invalid Bluesky post URL: ${url}`);
  }
  return { handle: match[1]!, rkey: match[2]! };
}

export interface ResolveWebUrlOptions {
  appviewUrl?: string;
  signal?: AbortSignal;
}

export async function webUrlToAtUri(
  url: string,
  options: ResolveWebUrlOptions = {}
): Promise<string> {
  const { handle, rkey } = parseBlueskyWebUrl(url);
  const base = options.appviewUrl ?? DEFAULT_APPVIEW;
  const endpoint = `${base}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`;
  const res = await fetch(endpoint, {
    signal: options.signal,
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to resolve handle ${handle}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as { did?: string };
  if (!data.did) {
    throw new Error(`Resolver returned no DID for ${handle}`);
  }
  return `at://${data.did}/app.bsky.feed.post/${rkey}`;
}
