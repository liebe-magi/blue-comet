/**
 * 記事関連のAPI操作モジュール
 */
import { ArticleInfo, ArticlePostResult } from '../types';
import { logger } from '../utils';
import { blueskyAgent } from './agent';

/**
 * 記事参照用の投稿を作成する
 * @param articleInfo 記事情報
 * @returns 投稿結果
 */
export const createArticlePost = async (articleInfo: ArticleInfo): Promise<ArticlePostResult> => {
  const agent = blueskyAgent.getAgent();

  if (!blueskyAgent.isSessionValid()) {
    throw new Error('認証されていません。ログインしてください。');
  }

  // 記事を特定するためのテキスト作成
  let postText = `記事タイトル: ${articleInfo.title}\n記事ID: ${articleInfo.articleId}`;

  // URLがある場合は追加
  if (articleInfo.url) {
    postText += `\nURL: ${articleInfo.url}`;
  }

  // 記事参照用の投稿を作成
  const response = await agent.post({
    text: postText,
    langs: ['ja'],
    createdAt: new Date().toISOString(),
  });

  // 投稿のURIとCIDを記録
  return {
    uri: response.uri,
    cid: response.cid,
    articleId: articleInfo.articleId,
  };
};

/**
 * 記事IDから関連する投稿を検索する
 * @param articleId 記事ID
 * @returns 見つかった投稿のURIとCID
 */
export const findArticlePost = async (
  articleId: string
): Promise<{ uri: string; cid: string } | null> => {
  const agent = blueskyAgent.getAgent();

  // 記事IDを含む投稿を検索
  // Note: Blueskyの検索機能は限定的なので、実際の実装ではより複雑な検索ロジックが必要かもしれません
  try {
    const searchQuery = `記事ID: ${articleId}`;
    const searchResult = await agent.app.bsky.feed.searchPosts({ q: searchQuery, limit: 1 });

    if (searchResult.data.posts.length > 0) {
      const post = searchResult.data.posts[0];
      return {
        uri: post.uri,
        cid: post.cid,
      };
    }

    return null;
  } catch (error) {
    logger.error('記事投稿の検索中にエラーが発生しました:', error);
    return null;
  }
};
