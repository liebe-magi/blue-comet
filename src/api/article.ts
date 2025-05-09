/**
 * API operations module for article-related functions
 */
import { ArticleInfo, ArticlePostResult } from '../types';
import { logger } from '../utils';
import { blueskyAgent } from './agent';

/**
 * Create a reference post for an article
 * @param articleInfo Article information
 * @returns Posting result
 */
export const createArticlePost = async (articleInfo: ArticleInfo): Promise<ArticlePostResult> => {
  const agent = blueskyAgent.getAgent();

  if (!blueskyAgent.isSessionValid()) {
    throw new Error('Not authenticated. Please login.');
  }

  // Create text to identify the article
  let postText = `Article Title: ${articleInfo.title}\nArticle ID: ${articleInfo.articleId}`;

  // Add URL if available
  if (articleInfo.url) {
    postText += `\nURL: ${articleInfo.url}`;
  }

  // Create a reference post for the article
  const response = await agent.post({
    text: postText,
    langs: ['en'],
    createdAt: new Date().toISOString(),
  });

  // Record the URI and CID of the post
  return {
    uri: response.uri,
    cid: response.cid,
    articleId: articleInfo.articleId,
  };
};

/**
 * Find related posts by article ID
 * @param articleId Article ID
 * @returns URI and CID of the found post
 */
export const findArticlePost = async (
  articleId: string
): Promise<{ uri: string; cid: string } | null> => {
  const agent = blueskyAgent.getAgent();

  // Search for posts containing the article ID
  // Note: Bluesky's search capability is limited, so a more complex search logic might be needed in actual implementation
  try {
    const searchQuery = `Article ID: ${articleId}`;
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
    logger.error('An error occurred while searching for article posts:', error);
    return null;
  }
};
