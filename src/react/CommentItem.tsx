'use client';

import type { ReactNode } from 'react';
import type { Comment, BlueCometCommentsClassNames } from '../core/types';
import { buildBlueskyPostUrl } from '../core/uri';
import { HeartIcon, QuoteIcon, ReplyIcon, RepostIcon } from './icons';

export interface CommentItemProps {
  comment: Comment;
  classNames?: BlueCometCommentsClassNames;
  renderComment?: (comment: Comment) => ReactNode;
  locale?: string;
}

export function CommentItem({ comment, classNames, renderComment, locale }: CommentItemProps) {
  if (renderComment) {
    return <>{renderComment(comment)}</>;
  }

  const itemClass = ['bluecomet-item', classNames?.item].filter(Boolean).join(' ');
  const headerClass = ['bluecomet-item-header', classNames?.itemHeader].filter(Boolean).join(' ');
  const metaClass = ['bluecomet-item-meta', classNames?.itemMeta].filter(Boolean).join(' ');
  const avatarClass = ['bluecomet-avatar', classNames?.avatar].filter(Boolean).join(' ');
  const displayNameClass = ['bluecomet-display-name', classNames?.displayName]
    .filter(Boolean)
    .join(' ');
  const handleClass = ['bluecomet-handle', classNames?.handle].filter(Boolean).join(' ');
  const dateClass = ['bluecomet-date', classNames?.date].filter(Boolean).join(' ');
  const textClass = ['bluecomet-text', classNames?.text].filter(Boolean).join(' ');
  const repliesClass = ['bluecomet-replies', classNames?.replies].filter(Boolean).join(' ');
  const footerClass = ['bluecomet-item-footer', classNames?.itemFooter].filter(Boolean).join(' ');
  const itemReplyClass = ['bluecomet-item-reply', classNames?.itemReply, classNames?.replyButton]
    .filter(Boolean)
    .join(' ');
  const metricsClass = ['bluecomet-item-metrics', classNames?.itemMetrics]
    .filter(Boolean)
    .join(' ');
  const metricClass = ['bluecomet-item-metric', classNames?.itemMetric].filter(Boolean).join(' ');

  const profileUrl = `https://bsky.app/profile/${comment.author.handle}`;
  const postUrl = (() => {
    try {
      return buildBlueskyPostUrl(comment.uri, comment.author.handle);
    } catch {
      return null;
    }
  })();
  const formatted = formatDate(comment.indexedAt, locale);

  return (
    <article className={itemClass}>
      <div className={headerClass}>
        {comment.author.avatar ? (
          <img
            src={comment.author.avatar}
            alt=""
            className={avatarClass}
            width={32}
            height={32}
            loading="lazy"
          />
        ) : (
          <div className={avatarClass} aria-hidden="true" />
        )}
        <div className={metaClass}>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={displayNameClass}
          >
            {comment.author.displayName ?? comment.author.handle}
          </a>
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={handleClass}>
            @{comment.author.handle}
          </a>
          {postUrl ? (
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={dateClass}
              title={comment.indexedAt}
            >
              {formatted}
            </a>
          ) : (
            <time className={dateClass} dateTime={comment.indexedAt}>
              {formatted}
            </time>
          )}
        </div>
      </div>
      <p className={textClass}>{comment.text}</p>
      {postUrl || hasMetrics(comment) ? (
        <div className={footerClass}>
          {postUrl ? (
            <a href={postUrl} target="_blank" rel="noopener noreferrer" className={itemReplyClass}>
              <ReplyIcon className="bluecomet-icon" />
              <span>Reply</span>
            </a>
          ) : null}
          {hasMetrics(comment) ? (
            <div className={metricsClass} aria-label="post metrics">
              {comment.likeCount ? (
                <span className={metricClass} aria-label={`${comment.likeCount} likes`}>
                  <HeartIcon className="bluecomet-icon" />
                  <span>{formatMetric(comment.likeCount, locale)}</span>
                </span>
              ) : null}
              {comment.repostCount ? (
                <span className={metricClass} aria-label={`${comment.repostCount} reposts`}>
                  <RepostIcon className="bluecomet-icon" />
                  <span>{formatMetric(comment.repostCount, locale)}</span>
                </span>
              ) : null}
              {comment.quoteCount ? (
                <span className={metricClass} aria-label={`${comment.quoteCount} quotes`}>
                  <QuoteIcon className="bluecomet-icon" />
                  <span>{formatMetric(comment.quoteCount, locale)}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {comment.replies.length > 0 ? (
        <div className={repliesClass}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.cid}
              comment={reply}
              classNames={classNames}
              renderComment={renderComment}
              locale={locale}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function hasMetrics(comment: Comment): boolean {
  return Boolean(
    (comment.likeCount && comment.likeCount > 0) ||
    (comment.repostCount && comment.repostCount > 0) ||
    (comment.quoteCount && comment.quoteCount > 0)
  );
}

function formatMetric(count: number, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(
      count
    );
  } catch {
    return String(count);
  }
}

function formatDate(iso: string, locale?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toISOString();
  }
}
