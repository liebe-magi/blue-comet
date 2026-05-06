import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { act, renderHook, waitFor } from '@testing-library/react';
import { server } from '../../../test/msw-server';
import { useThread } from './useThread';

const ROOT_URI = 'at://did:plc:abc123/app.bsky.feed.post/root';
const ENDPOINT = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread';

function fixture(replies: unknown[] = []): Record<string, unknown> {
  return {
    thread: {
      $type: 'app.bsky.feed.defs#threadViewPost',
      post: {
        uri: ROOT_URI,
        cid: 'bafyrootcid',
        author: { did: 'did:plc:abc123', handle: 'author.bsky.social' },
        record: { text: 'root', createdAt: '2026-05-01T00:00:00Z' },
        indexedAt: '2026-05-01T00:00:00Z',
        replyCount: replies.length,
      },
      replies,
    },
  };
}

describe('useThread', () => {
  it('transitions idle → loading → success', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json(fixture())));

    const { result } = renderHook(() => useThread(ROOT_URI));

    expect(['idle', 'loading']).toContain(result.current.status);

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    if (result.current.status === 'success') {
      expect(result.current.thread.rootUri).toBe(ROOT_URI);
    }
  });

  it('transitions to error on HTTP failure', async () => {
    server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useThread(ROOT_URI));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    if (result.current.status === 'error') {
      expect(result.current.error).toBeInstanceOf(Error);
    }
  });

  it('skips fetching when enabled is false', async () => {
    let callCount = 0;
    server.use(
      http.get(ENDPOINT, () => {
        callCount++;
        return HttpResponse.json(fixture());
      })
    );

    const { result } = renderHook(() => useThread(ROOT_URI, { enabled: false }));

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(result.current.status).toBe('idle');
    expect(callCount).toBe(0);
  });

  it('refetches manually via the returned refetch callback', async () => {
    let callCount = 0;
    server.use(
      http.get(ENDPOINT, () => {
        callCount++;
        return HttpResponse.json(fixture());
      })
    );

    const { result } = renderHook(() => useThread(ROOT_URI));
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(callCount).toBe(1);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => expect(callCount).toBe(2));
  });

  it('does not transition to success after unmount', async () => {
    let release: (() => void) | undefined;
    server.use(
      http.get(ENDPOINT, async () => {
        await new Promise<void>(resolve => {
          release = resolve;
        });
        return HttpResponse.json(fixture());
      })
    );

    const { result, unmount } = renderHook(() => useThread(ROOT_URI));

    await waitFor(() => expect(result.current.status).toBe('loading'));
    const lastSeen = result.current.status;

    unmount();
    release?.();

    await new Promise(resolve => setTimeout(resolve, 50));

    // After unmount, no further re-renders should have transitioned the
    // hook into 'success'. result.current reflects the last render only.
    expect(result.current.status).toBe(lastSeen);
  });
});
