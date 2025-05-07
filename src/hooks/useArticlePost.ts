/**
 * 記事投稿を管理するReact Hook
 */
import { useCallback, useState } from 'react';
import { createArticlePost, findArticlePost } from '../api/article';
import { ArticleInfo, ArticlePostResult } from '../types';

/**
 * 記事参照用投稿の作成と管理を行うカスタムフック
 * @returns 記事投稿関連の状態と関数
 */
export const useArticlePost = () => {
  // 投稿処理の状態を管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [articlePostResult, setArticlePostResult] = useState<ArticlePostResult | null>(null);

  /**
   * 記事参照用の投稿を作成する
   * @param articleInfo 記事情報
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
        error instanceof Error ? error.message : '記事投稿中にエラーが発生しました';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * 記事IDから関連する投稿を検索する
   * @param articleId 記事ID
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
        setError('記事の投稿が見つかりませんでした');
        setLoading(false);
        return null;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '記事検索中にエラーが発生しました';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * 状態をリセットする
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
