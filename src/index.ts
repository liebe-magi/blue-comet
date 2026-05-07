// Components
export { BlueCometComments } from './react/BlueCometComments';
export { ReplyOnBluesky } from './react/ReplyOnBluesky';
export { EmptyState } from './react/EmptyState';
export { SkeletonState } from './react/SkeletonState';
export { CommentList } from './react/CommentList';
export { CommentItem } from './react/CommentItem';

export type { ReplyOnBlueskyProps } from './react/ReplyOnBluesky';
export type { EmptyStateProps } from './react/EmptyState';
export type { SkeletonStateProps } from './react/SkeletonState';
export type { CommentListProps } from './react/CommentList';
export type { CommentItemProps } from './react/CommentItem';

// Icons (re-exported so consumers can swap them via renderComment)
export { ReplyIcon, HeartIcon, RepostIcon, QuoteIcon } from './react/icons';

// Hooks
export { useThread } from './react/hooks/useThread';
export { useCommentCount } from './react/hooks/useCommentCount';

// URI helpers
export {
  parseAtUri,
  parseBlueskyWebUrl,
  buildBlueskyPostUrl,
  buildReplyComposerUrl,
  webUrlToAtUri,
} from './core/uri';

export type { AtUriParts, BlueskyWebUrlParts, ResolveWebUrlOptions } from './core/uri';

// Direct fetchers (for SSR / SSG / custom rendering)
export { fetchThread, fetchThreadCount } from './core/appview';
export type { FetchThreadOptions } from './core/appview';

// Types
export type {
  Author,
  Comment,
  Thread,
  UseThreadOptions,
  UseThreadResult,
  UseCommentCountOptions,
  UseCommentCountResult,
  BlueCometCommentsClassNames,
  BlueCometCommentsProps,
} from './core/types';

// Errors
export { BlueCometError, NotFoundError, NetworkError } from './core/errors';
