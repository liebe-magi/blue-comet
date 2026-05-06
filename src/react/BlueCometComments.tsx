'use client';

import type { BlueCometCommentsProps } from '../core/types';
import { CommentList } from './CommentList';
import { EmptyState } from './EmptyState';
import { ReplyOnBluesky } from './ReplyOnBluesky';
import { SkeletonState } from './SkeletonState';
import { useThread } from './hooks/useThread';

export function BlueCometComments(props: BlueCometCommentsProps) {
  const {
    postUri,
    depth,
    appviewUrl,
    className,
    classNames,
    emptyContent,
    loadingContent,
    errorContent,
    renderComment,
    replyLabel,
    locale,
  } = props;

  const result = useThread(postUri, { depth, appviewUrl });

  const rootClass = ['bluecomet-root', className, classNames?.root].filter(Boolean).join(' ');
  const headerClass = ['bluecomet-header', classNames?.header].filter(Boolean).join(' ');
  const replyButtonClass = ['bluecomet-reply-button', classNames?.replyButton]
    .filter(Boolean)
    .join(' ');
  const loadingClass = ['bluecomet-loading', classNames?.loading].filter(Boolean).join(' ');
  const errorClass = ['bluecomet-error', classNames?.error].filter(Boolean).join(' ');
  const emptyClass = ['bluecomet-empty', classNames?.empty].filter(Boolean).join(' ');

  if (result.status === 'success') {
    const { thread } = result;
    const handle = thread.rootAuthor.handle;
    const countLabel = formatCount(thread.totalCount, locale);

    return (
      <section className={rootClass}>
        <header className={headerClass}>
          <span>{countLabel}</span>
          <ReplyOnBluesky postUri={postUri} authorHandle={handle} className={replyButtonClass}>
            {replyLabel}
          </ReplyOnBluesky>
        </header>
        {thread.comments.length === 0 ? (
          (emptyContent ?? (
            <EmptyState
              postUri={postUri}
              authorHandle={handle}
              className={emptyClass}
              replyButtonClassName={replyButtonClass}
            />
          ))
        ) : (
          <CommentList
            comments={thread.comments}
            classNames={classNames}
            renderComment={renderComment}
            locale={locale}
          />
        )}
      </section>
    );
  }

  if (result.status === 'error') {
    return (
      <div className={rootClass}>
        {errorContent ? (
          errorContent(result.error)
        ) : (
          <p className={errorClass}>Failed to load comments.</p>
        )}
      </div>
    );
  }

  return (
    <div className={rootClass}>{loadingContent ?? <SkeletonState className={loadingClass} />}</div>
  );
}

function formatCount(count: number, locale?: string): string {
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(locale).format(count);
  } catch {
    formatted = String(count);
  }
  return count === 1 ? `${formatted} comment` : `${formatted} comments`;
}
