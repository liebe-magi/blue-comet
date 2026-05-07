'use client';

import { ReplyOnBluesky } from './ReplyOnBluesky';

export interface EmptyStateProps {
  postUri: string;
  authorHandle?: string;
  className?: string;
  replyButtonClassName?: string;
}

export function EmptyState({
  postUri,
  authorHandle,
  className,
  replyButtonClassName,
}: EmptyStateProps) {
  return (
    <div className={className}>
      <p>No comments yet.</p>
      <ReplyOnBluesky
        postUri={postUri}
        authorHandle={authorHandle}
        className={replyButtonClassName}
      >
        Be the first to reply on Bluesky
      </ReplyOnBluesky>
    </div>
  );
}
