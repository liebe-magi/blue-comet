/**
 * コメント関連のAPI操作モジュール
 */
import { AppBskyFeedDefs } from '@atproto/api';
import { CommentInfo } from '../types';
import { logger } from '../utils';
import { blueskyAgent } from './agent';

/**
 * 記事へのコメントを投稿する
 * @param articleUri 記事投稿のURI
 * @param articleCid 記事投稿のCID
 * @param commentText コメントのテキスト
 * @returns 投稿結果
 */
export const postComment = async (
  articleUri: string,
  articleCid: string,
  commentText: string
): Promise<{ uri: string; cid: string }> => {
  const agent = blueskyAgent.getAgent();

  if (!blueskyAgent.isSessionValid()) {
    throw new Error('認証されていません。ログインしてください。');
  }

  // 記事投稿への返信としてコメントを投稿
  const response = await agent.post({
    text: commentText,
    reply: {
      root: {
        uri: articleUri,
        cid: articleCid,
      },
      parent: {
        uri: articleUri,
        cid: articleCid,
      },
    },
    langs: ['ja'],
    createdAt: new Date().toISOString(),
  });

  return {
    uri: response.uri,
    cid: response.cid,
  };
};

/**
 * 記事に対するコメントを取得する
 * @param articleUri 記事投稿のURI
 * @returns コメント一覧
 */
export const getComments = async (articleUri: string): Promise<CommentInfo[]> => {
  const agent = blueskyAgent.getAgent();

  try {
    // 投稿のスレッドを取得（返信を含む）
    const threadResponse = await agent.getPostThread({
      uri: articleUri,
      depth: 1, // 直接の返信のみを取得
    });

    // スレッドの種類をチェック（ThreadViewPostかどうか）
    if (AppBskyFeedDefs.isThreadViewPost(threadResponse.data.thread)) {
      // ThreadViewPostであれば返信を取得
      const replies = threadResponse.data.thread.replies || [];

      // コメント情報に変換
      const comments = replies
        .filter(reply => AppBskyFeedDefs.isThreadViewPost(reply))
        .map(reply => {
          const post = reply.post;
          const profile = post.author;

          return {
            uri: post.uri,
            cid: post.cid,
            text: post.record.text as string,
            author: {
              did: profile.did,
              handle: profile.handle,
              displayName: profile.displayName,
              avatar: profile.avatar,
            },
            createdAt: post.record.createdAt as string,
            indexedAt: post.indexedAt,
          };
        });

      return comments;
    }

    // ThreadViewPost以外の場合は空の配列を返す
    return [];
  } catch (error) {
    logger.error('コメントの取得中にエラーが発生しました:', error);
    return [];
  }
};
