import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw-server';
import {
  buildBlueskyPostUrl,
  buildReplyComposerUrl,
  parseAtUri,
  parseBlueskyWebUrl,
  webUrlToAtUri,
} from './uri';

const SAMPLE_URI = 'at://did:plc:abc123/app.bsky.feed.post/3kabcxyz';

describe('parseAtUri', () => {
  it('extracts did, collection, and rkey', () => {
    expect(parseAtUri(SAMPLE_URI)).toEqual({
      did: 'did:plc:abc123',
      collection: 'app.bsky.feed.post',
      rkey: '3kabcxyz',
    });
  });

  it('throws on malformed input', () => {
    expect(() => parseAtUri('not a uri')).toThrow(/Invalid at:\/\/ URI/);
    expect(() => parseAtUri('at://only-did')).toThrow(/Invalid at:\/\/ URI/);
    expect(() => parseAtUri('https://bsky.app/x')).toThrow(/Invalid at:\/\/ URI/);
  });
});

describe('buildBlueskyPostUrl', () => {
  it('uses the did when no handle is given', () => {
    expect(buildBlueskyPostUrl(SAMPLE_URI)).toBe(
      'https://bsky.app/profile/did:plc:abc123/post/3kabcxyz'
    );
  });

  it('prefers a handle when provided', () => {
    expect(buildBlueskyPostUrl(SAMPLE_URI, 'alice.bsky.social')).toBe(
      'https://bsky.app/profile/alice.bsky.social/post/3kabcxyz'
    );
  });
});

describe('buildReplyComposerUrl', () => {
  it('points at the post page so bsky.app shows the reply composer', () => {
    expect(buildReplyComposerUrl(SAMPLE_URI, 'alice.bsky.social')).toBe(
      'https://bsky.app/profile/alice.bsky.social/post/3kabcxyz'
    );
  });
});

describe('parseBlueskyWebUrl', () => {
  it('extracts handle and rkey from a bsky.app URL', () => {
    expect(parseBlueskyWebUrl('https://bsky.app/profile/alice.bsky.social/post/3kabcxyz')).toEqual({
      handle: 'alice.bsky.social',
      rkey: '3kabcxyz',
    });
  });

  it('also accepts deer.social mirrors', () => {
    expect(
      parseBlueskyWebUrl('https://deer.social/profile/alice.bsky.social/post/3kabcxyz')
    ).toEqual({ handle: 'alice.bsky.social', rkey: '3kabcxyz' });
  });

  it('throws on non-Bluesky URLs', () => {
    expect(() => parseBlueskyWebUrl('https://example.com/profile/x/post/y')).toThrow(
      /Invalid Bluesky post URL/
    );
  });
});

describe('webUrlToAtUri', () => {
  it('resolves the handle to a DID and returns an at:// URI', async () => {
    server.use(
      http.get(
        'https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle',
        ({ request }) => {
          const handle = new URL(request.url).searchParams.get('handle');
          expect(handle).toBe('alice.bsky.social');
          return HttpResponse.json({ did: 'did:plc:abc123' });
        }
      )
    );

    const result = await webUrlToAtUri('https://bsky.app/profile/alice.bsky.social/post/3kabcxyz');
    expect(result).toBe('at://did:plc:abc123/app.bsky.feed.post/3kabcxyz');
  });

  it('throws when the resolver returns a non-OK response', async () => {
    server.use(
      http.get(
        'https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle',
        () => new HttpResponse(null, { status: 404 })
      )
    );

    await expect(
      webUrlToAtUri('https://bsky.app/profile/missing.bsky.social/post/3kabcxyz')
    ).rejects.toThrow(/Failed to resolve handle/);
  });

  it('throws when the resolver returns no DID', async () => {
    server.use(
      http.get('https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle', () =>
        HttpResponse.json({})
      )
    );

    await expect(
      webUrlToAtUri('https://bsky.app/profile/alice.bsky.social/post/3kabcxyz')
    ).rejects.toThrow(/no DID/);
  });
});
