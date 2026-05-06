import { NetworkError, NotFoundError } from './errors';
import type { Author, Comment, Thread } from './types';

const DEFAULT_APPVIEW = 'https://public.api.bsky.app';
const DEFAULT_DEPTH = 6;
const MAX_DEPTH = 1000;

const THREAD_VIEW_TYPE = 'app.bsky.feed.defs#threadViewPost';
const NOT_FOUND_TYPE = 'app.bsky.feed.defs#notFoundPost';
const BLOCKED_TYPE = 'app.bsky.feed.defs#blockedPost';

export interface FetchThreadOptions {
  depth?: number;
  appviewUrl?: string;
  signal?: AbortSignal;
}

export async function fetchThread(uri: string, options: FetchThreadOptions = {}): Promise<Thread> {
  const depth = clamp(options.depth ?? DEFAULT_DEPTH, 0, MAX_DEPTH);
  const json = await getPostThread(uri, { ...options, depth });
  return normalizeThread(json, uri);
}

export async function fetchThreadCount(
  uri: string,
  options: Omit<FetchThreadOptions, 'depth'> = {}
): Promise<number> {
  const json = await getPostThread(uri, { ...options, depth: 0 });
  if (!isObject(json) || !isObject(json.thread)) {
    throw new NetworkError('Unexpected AppView response shape');
  }
  const view = json.thread as ApiThreadView;
  if (view.$type === NOT_FOUND_TYPE) {
    throw new NotFoundError(uri);
  }
  if (view.$type === BLOCKED_TYPE) {
    throw new NetworkError('Post is blocked or unavailable');
  }
  if (view.$type !== THREAD_VIEW_TYPE || !view.post) {
    throw new NetworkError(`Unsupported thread type: ${view.$type ?? 'unknown'}`);
  }
  return typeof view.post.replyCount === 'number' ? view.post.replyCount : 0;
}

interface ApiThreadView {
  $type?: string;
  post?: ApiPostView;
  replies?: ApiThreadView[];
  parent?: ApiThreadView;
}

interface ApiPostView {
  uri: string;
  cid: string;
  author: ApiAuthor;
  record: { text?: unknown; createdAt?: unknown; [key: string]: unknown };
  indexedAt: string;
  replyCount?: number;
}

interface ApiAuthor {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

async function getPostThread(uri: string, options: FetchThreadOptions): Promise<unknown> {
  const base = options.appviewUrl ?? DEFAULT_APPVIEW;
  const depth = options.depth ?? DEFAULT_DEPTH;
  const url = `${base}/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=${depth}&parentHeight=0`;

  let res: Response;
  try {
    res = await fetch(url, {
      signal: options.signal,
      headers: { accept: 'application/json' },
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause;
    }
    throw new NetworkError('Failed to reach AppView', { cause });
  }

  if (res.status === 404) {
    throw new NotFoundError(uri);
  }
  if (res.status === 400) {
    // AppView returns 400 for malformed/non-existent URIs in some cases
    throw new NotFoundError(uri);
  }
  if (!res.ok) {
    throw new NetworkError(`AppView returned ${res.status}`);
  }

  try {
    return await res.json();
  } catch (cause) {
    throw new NetworkError('AppView returned malformed JSON', { cause });
  }
}

function normalizeThread(json: unknown, uri: string): Thread {
  if (!isObject(json) || !isObject(json.thread)) {
    throw new NetworkError('Unexpected AppView response shape');
  }
  const view = json.thread as ApiThreadView;

  if (view.$type === NOT_FOUND_TYPE) {
    throw new NotFoundError(uri);
  }
  if (view.$type === BLOCKED_TYPE) {
    throw new NetworkError('Post is blocked or unavailable');
  }
  if (view.$type !== THREAD_VIEW_TYPE || !view.post) {
    throw new NetworkError(`Unsupported thread type: ${view.$type ?? 'unknown'}`);
  }

  const rootPost = view.post;
  const comments = collectComments(view.replies);
  const totalCount = countAll(comments);

  return {
    rootUri: rootPost.uri,
    rootCid: rootPost.cid,
    rootAuthor: authorFromApi(rootPost.author),
    comments,
    totalCount,
  };
}

function collectComments(replies: ApiThreadView[] | undefined): Comment[] {
  if (!replies || replies.length === 0) return [];
  return replies
    .filter(
      (reply): reply is ApiThreadView & { post: ApiPostView } =>
        reply.$type === THREAD_VIEW_TYPE && !!reply.post
    )
    .map(commentFromThreadView);
}

function commentFromThreadView(view: ApiThreadView & { post: ApiPostView }): Comment {
  const post = view.post;
  const text = typeof post.record.text === 'string' ? post.record.text : '';
  const createdAt =
    typeof post.record.createdAt === 'string' ? post.record.createdAt : post.indexedAt;

  return {
    uri: post.uri,
    cid: post.cid,
    text,
    createdAt,
    indexedAt: post.indexedAt,
    author: authorFromApi(post.author),
    replies: collectComments(view.replies),
  };
}

function authorFromApi(author: ApiAuthor): Author {
  const result: Author = {
    did: author.did,
    handle: author.handle,
  };
  if (author.displayName) result.displayName = author.displayName;
  if (author.avatar) result.avatar = author.avatar;
  return result;
}

function countAll(comments: Comment[]): number {
  let total = 0;
  for (const comment of comments) {
    total += 1 + countAll(comment.replies);
  }
  return total;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
