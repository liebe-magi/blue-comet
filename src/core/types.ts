import type { ReactNode } from 'react';

export interface Author {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

export interface Comment {
  uri: string;
  cid: string;
  text: string;
  createdAt: string;
  indexedAt: string;
  author: Author;
  replies: Comment[];
}

export interface Thread {
  rootUri: string;
  rootCid: string;
  rootAuthor: Author;
  comments: Comment[];
  totalCount: number;
}

export interface UseThreadOptions {
  depth?: number;
  appviewUrl?: string;
  refetchInterval?: number;
  enabled?: boolean;
}

export type UseThreadResult =
  | {
      status: 'idle' | 'loading';
      thread: undefined;
      error: undefined;
      refetch: () => void;
    }
  | {
      status: 'success';
      thread: Thread;
      error: undefined;
      refetch: () => void;
    }
  | {
      status: 'error';
      thread: undefined;
      error: Error;
      refetch: () => void;
    };

export interface UseCommentCountOptions {
  appviewUrl?: string;
  refetchInterval?: number;
  enabled?: boolean;
}

export type UseCommentCountResult =
  | { status: 'idle' | 'loading'; count: undefined; error: undefined; refetch: () => void }
  | { status: 'success'; count: number; error: undefined; refetch: () => void }
  | { status: 'error'; count: undefined; error: Error; refetch: () => void };

export interface BlueCometCommentsClassNames {
  root?: string;
  header?: string;
  list?: string;
  item?: string;
  itemHeader?: string;
  itemMeta?: string;
  avatar?: string;
  displayName?: string;
  handle?: string;
  date?: string;
  text?: string;
  replies?: string;
  replyButton?: string;
  empty?: string;
  loading?: string;
  error?: string;
}

export interface BlueCometCommentsProps {
  postUri: string;
  depth?: number;
  appviewUrl?: string;
  className?: string;
  classNames?: BlueCometCommentsClassNames;
  emptyContent?: ReactNode;
  loadingContent?: ReactNode;
  errorContent?: (error: Error) => ReactNode;
  renderComment?: (comment: Comment) => ReactNode;
  replyLabel?: ReactNode;
  locale?: string;
}
