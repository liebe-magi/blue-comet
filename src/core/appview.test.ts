import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw-server';
import { fetchThread, fetchThreadCount } from './appview';
import { NetworkError, NotFoundError } from './errors';

const ROOT_URI = 'at://did:plc:abc123/app.bsky.feed.post/root';
const APPVIEW_ENDPOINT = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread';

type JsonObject = Record<string, unknown>;

interface ThreadFixtureOptions {
  replies?: JsonObject[];
  replyCount?: number;
}

function buildThreadFixture(options: ThreadFixtureOptions = {}): JsonObject {
  return {
    thread: {
      $type: 'app.bsky.feed.defs#threadViewPost',
      post: {
        uri: ROOT_URI,
        cid: 'bafyrootcid',
        author: {
          did: 'did:plc:abc123',
          handle: 'author.bsky.social',
          displayName: 'Author',
          avatar: 'https://example.com/avatar.png',
        },
        record: {
          text: 'Original article post',
          createdAt: '2026-05-01T00:00:00Z',
        },
        indexedAt: '2026-05-01T00:00:01Z',
        replyCount: options.replyCount ?? options.replies?.length ?? 0,
      },
      replies: options.replies ?? [],
    },
  };
}

function buildReply(opts: {
  rkey: string;
  text: string;
  handle?: string;
  createdAt?: string;
  replies?: JsonObject[];
}): JsonObject {
  return {
    $type: 'app.bsky.feed.defs#threadViewPost',
    post: {
      uri: `at://did:plc:def456/app.bsky.feed.post/${opts.rkey}`,
      cid: `bafy${opts.rkey}`,
      author: {
        did: 'did:plc:def456',
        handle: opts.handle ?? 'commenter.bsky.social',
      },
      record: {
        text: opts.text,
        createdAt: opts.createdAt ?? '2026-05-02T00:00:00Z',
      },
      indexedAt: opts.createdAt ?? '2026-05-02T00:00:00Z',
      replyCount: opts.replies?.length ?? 0,
    },
    replies: opts.replies ?? [],
  };
}

describe('fetchThread', () => {
  it('returns a normalized thread with flat top-level comments', async () => {
    server.use(
      http.get(APPVIEW_ENDPOINT, ({ request }) => {
        const params = new URL(request.url).searchParams;
        expect(params.get('uri')).toBe(ROOT_URI);
        expect(params.get('depth')).toBe('6');
        return HttpResponse.json(
          buildThreadFixture({
            replies: [
              buildReply({ rkey: 'r1', text: 'first comment' }),
              buildReply({ rkey: 'r2', text: 'second comment' }),
            ],
          })
        );
      })
    );

    const thread = await fetchThread(ROOT_URI);
    expect(thread.rootUri).toBe(ROOT_URI);
    expect(thread.rootAuthor.handle).toBe('author.bsky.social');
    expect(thread.comments).toHaveLength(2);
    expect(thread.comments[0]?.text).toBe('first comment');
    expect(thread.comments[0]?.replies).toEqual([]);
    expect(thread.totalCount).toBe(2);
  });

  it('includes nested replies in the count', async () => {
    server.use(
      http.get(APPVIEW_ENDPOINT, () =>
        HttpResponse.json(
          buildThreadFixture({
            replies: [
              buildReply({
                rkey: 'r1',
                text: 'parent',
                replies: [buildReply({ rkey: 'r1a', text: 'nested' })],
              }),
            ],
          })
        )
      )
    );

    const thread = await fetchThread(ROOT_URI);
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments[0]?.replies).toHaveLength(1);
    expect(thread.comments[0]?.replies[0]?.text).toBe('nested');
    expect(thread.totalCount).toBe(2);
  });

  it('clamps depth between 0 and 1000', async () => {
    server.use(
      http.get(APPVIEW_ENDPOINT, ({ request }) => {
        const depth = new URL(request.url).searchParams.get('depth');
        expect(depth).toBe('1000');
        return HttpResponse.json(buildThreadFixture());
      })
    );

    await fetchThread(ROOT_URI, { depth: 9999 });
  });

  it('throws NotFoundError for notFoundPost responses', async () => {
    server.use(
      http.get(APPVIEW_ENDPOINT, () =>
        HttpResponse.json({
          thread: {
            $type: 'app.bsky.feed.defs#notFoundPost',
            uri: ROOT_URI,
            notFound: true,
          },
        })
      )
    );

    await expect(fetchThread(ROOT_URI)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFoundError on HTTP 404', async () => {
    server.use(http.get(APPVIEW_ENDPOINT, () => new HttpResponse(null, { status: 404 })));

    await expect(fetchThread(ROOT_URI)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NetworkError for blocked posts', async () => {
    server.use(
      http.get(APPVIEW_ENDPOINT, () =>
        HttpResponse.json({
          thread: { $type: 'app.bsky.feed.defs#blockedPost' },
        })
      )
    );

    await expect(fetchThread(ROOT_URI)).rejects.toBeInstanceOf(NetworkError);
  });

  it('throws NetworkError on 5xx', async () => {
    server.use(http.get(APPVIEW_ENDPOINT, () => new HttpResponse(null, { status: 503 })));

    await expect(fetchThread(ROOT_URI)).rejects.toBeInstanceOf(NetworkError);
  });

  it('throws NetworkError on malformed JSON', async () => {
    server.use(
      http.get(
        APPVIEW_ENDPOINT,
        () =>
          new HttpResponse('not json', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
      )
    );

    await expect(fetchThread(ROOT_URI)).rejects.toBeInstanceOf(NetworkError);
  });

  it('honors a custom appviewUrl', async () => {
    let hit = false;
    server.use(
      http.get('https://custom.example.com/xrpc/app.bsky.feed.getPostThread', () => {
        hit = true;
        return HttpResponse.json(buildThreadFixture());
      })
    );

    await fetchThread(ROOT_URI, { appviewUrl: 'https://custom.example.com' });
    expect(hit).toBe(true);
  });
});

describe('fetchThreadCount', () => {
  it('returns the post replyCount with depth=0', async () => {
    server.use(
      http.get(APPVIEW_ENDPOINT, ({ request }) => {
        const depth = new URL(request.url).searchParams.get('depth');
        expect(depth).toBe('0');
        return HttpResponse.json(buildThreadFixture({ replyCount: 12 }));
      })
    );

    expect(await fetchThreadCount(ROOT_URI)).toBe(12);
  });

  it('returns 0 when replyCount is missing', async () => {
    server.use(
      http.get(APPVIEW_ENDPOINT, () =>
        HttpResponse.json({
          thread: {
            $type: 'app.bsky.feed.defs#threadViewPost',
            post: {
              uri: ROOT_URI,
              cid: 'bafy',
              author: { did: 'did:plc:abc', handle: 'a.bsky.social' },
              record: { text: '', createdAt: '2026-05-01T00:00:00Z' },
              indexedAt: '2026-05-01T00:00:00Z',
            },
          },
        })
      )
    );

    expect(await fetchThreadCount(ROOT_URI)).toBe(0);
  });
});
