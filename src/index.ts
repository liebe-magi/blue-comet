// Public re-exports for the React entry point.
// Phase 1 only ships the core layer; the React layer lands in Phase 2.

export {
  parseAtUri,
  parseBlueskyWebUrl,
  buildBlueskyPostUrl,
  buildReplyComposerUrl,
  webUrlToAtUri,
} from './core/uri';

export type { AtUriParts, BlueskyWebUrlParts, ResolveWebUrlOptions } from './core/uri';

export { fetchThread, fetchThreadCount } from './core/appview';
export type { FetchThreadOptions } from './core/appview';

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

export { BlueCometError, NotFoundError, NetworkError } from './core/errors';
