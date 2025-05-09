/**
 * React Hook for managing article posts
 */
import { useCallback, useState } from 'react';
import { createArticlePost, findArticlePost } from '../api/article';
import { ArticleInfo, ArticlePostResult } from '../types';

/**
 * Custom hook for creating and managing article reference posts
 * @returns States and functions related to article posting
 */
export const useArticlePost = () => {
  // Manage post processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [articlePostResult, setArticlePostResult] = useState<ArticlePostResult | null>(null);

  /**
   * Create a reference post for an article
   * @param articleInfo Article information
   */
  const postArticleReference = useCallback(async (articleInfo: ArticleInfo) => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await createArticlePost(articleInfo);
      setArticlePostResult(result);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred while posting the article';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * Find related posts for an article ID
   * @param articleId Article ID
   */
  const findArticleReference = useCallback(async (articleId: string) => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await findArticlePost(articleId);
      if (result) {
        const articleResult: ArticlePostResult = {
          ...result,
          articleId,
        };
        setArticlePostResult(articleResult);
        setLoading(false);
        return articleResult;
      } else {
        setError('Article post not found');
        setLoading(false);
        return null;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while searching for the article';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setArticlePostResult(null);
    setError(undefined);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    articlePostResult,
    postArticleReference,
    findArticleReference,
    reset,
  };
};
