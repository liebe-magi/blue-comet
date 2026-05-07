'use client';

import type { ReactNode } from 'react';
import { buildReplyComposerUrl } from '../core/uri';
import { ReplyIcon } from './icons';

export interface ReplyOnBlueskyProps {
  postUri: string;
  authorHandle?: string;
  className?: string;
  children?: ReactNode;
}

export function ReplyOnBluesky({
  postUri,
  authorHandle,
  className,
  children,
}: ReplyOnBlueskyProps) {
  let href: string;
  try {
    href = buildReplyComposerUrl(postUri, authorHandle);
  } catch {
    return null;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children ?? (
        <>
          <ReplyIcon className="bluecomet-icon" />
          <span>Reply on Bluesky</span>
        </>
      )}
    </a>
  );
}
