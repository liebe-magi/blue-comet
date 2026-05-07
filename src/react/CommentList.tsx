'use client';

import type { ReactNode } from 'react';
import type { Comment, BlueCometCommentsClassNames } from '../core/types';
import { CommentItem } from './CommentItem';

export interface CommentListProps {
  comments: Comment[];
  classNames?: BlueCometCommentsClassNames;
  renderComment?: (comment: Comment) => ReactNode;
  locale?: string;
}

export function CommentList({ comments, classNames, renderComment, locale }: CommentListProps) {
  const listClass = ['bluecomet-list', classNames?.list].filter(Boolean).join(' ');
  return (
    <div className={listClass}>
      {comments.map(comment => (
        <CommentItem
          key={comment.cid}
          comment={comment}
          classNames={classNames}
          renderComment={renderComment}
          locale={locale}
        />
      ))}
    </div>
  );
}
