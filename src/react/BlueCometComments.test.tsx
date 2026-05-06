import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../../test/msw-server';
import { BlueCometComments } from './BlueCometComments';

const ROOT_URI = 'at://did:plc:abc123/app.bsky.feed.post/root';
const ENDPOINT = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread';

interface ReplyOpts {
  rkey: string;
  text: string;
  handle?: string;
  replies?: ReplyOpts[];
}

function buildReply(opts: ReplyOpts): Record<string, unknown> {
  return {
    $type: 'app.bsky.feed.defs#threadViewPost',
    post: {
      uri: `at://did:plc:def456/app.bsky.feed.post/${opts.rkey}`,
      cid: `bafy${opts.rkey}`,
      author: {
        did: 'did:plc:def456',
        handle: opts.handle ?? 'commenter.bsky.social',
        displayName: 'Commenter',
      },
      record: { text: opts.text, createdAt: '2026-05-02T00:00:00Z' },
      indexedAt: '2026-05-02T00:00:00Z',
      replyCount: opts.replies?.length ?? 0,
    },
    replies: opts.replies?.map(buildReply) ?? [],
  };
}

function buildThread(replies: ReplyOpts[]): Record<string, unknown> {
  const built = replies.map(buildReply);
  return {
    thread: {
      $type: 'app.bsky.feed.defs#threadViewPost',
      post: {
        uri: ROOT_URI,
        cid: 'bafyroot',
        author: { did: 'did:plc:abc123', handle: 'author.bsky.social' },
        record: { text: 'Original article post', createdAt: '2026-05-01T00:00:00Z' },
        indexedAt: '2026-05-01T00:00:00Z',
        replyCount: built.length,
      },
      replies: built,
    },
  };
}

describe('<BlueCometComments />', () => {
  it('renders an empty state when there are no replies', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json(buildThread([]))));

    render(<BlueCometComments postUri={ROOT_URI} />);

    await waitFor(() => expect(screen.getByText('No comments yet.')).toBeInTheDocument());

    const reply = screen.getByText('Be the first to reply on Bluesky');
    expect(reply.tagName).toBe('A');
    expect(reply).toHaveAttribute('href', 'https://bsky.app/profile/author.bsky.social/post/root');
    expect(reply).toHaveAttribute('target', '_blank');
  });

  it('renders nested replies with author and text', async () => {
    server.use(
      http.get(ENDPOINT, () =>
        HttpResponse.json(
          buildThread([
            {
              rkey: 'r1',
              text: 'parent comment',
              replies: [{ rkey: 'r1a', text: 'nested reply' }],
            },
          ])
        )
      )
    );

    render(<BlueCometComments postUri={ROOT_URI} />);

    await waitFor(() => expect(screen.getByText('parent comment')).toBeInTheDocument());
    expect(screen.getByText('nested reply')).toBeInTheDocument();
    expect(screen.getByText('2 comments')).toBeInTheDocument();
  });

  it('renders the count as singular for one comment', async () => {
    server.use(
      http.get(ENDPOINT, () => HttpResponse.json(buildThread([{ rkey: 'r1', text: 'only one' }])))
    );

    render(<BlueCometComments postUri={ROOT_URI} />);
    await waitFor(() => expect(screen.getByText('1 comment')).toBeInTheDocument());
  });

  it('renders the error fallback on network failure', async () => {
    server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 500 })));

    render(<BlueCometComments postUri={ROOT_URI} />);

    await waitFor(() => expect(screen.getByText('Failed to load comments.')).toBeInTheDocument());
  });

  it('lets the caller override the error state', async () => {
    server.use(http.get(ENDPOINT, () => new HttpResponse(null, { status: 500 })));

    render(
      <BlueCometComments
        postUri={ROOT_URI}
        errorContent={error => <p>custom-error: {error.message}</p>}
      />
    );

    await waitFor(() => expect(screen.getByText(/custom-error:/)).toBeInTheDocument());
  });

  it('builds the Reply on Bluesky link from the resolved root author', async () => {
    server.use(http.get(ENDPOINT, () => HttpResponse.json(buildThread([]))));

    render(<BlueCometComments postUri={ROOT_URI} replyLabel="Comment on Bluesky" />);

    await waitFor(() => expect(screen.getByText('Comment on Bluesky')).toBeInTheDocument());
    const link = screen.getByText('Comment on Bluesky');
    expect(link).toHaveAttribute('href', 'https://bsky.app/profile/author.bsky.social/post/root');
  });
});
