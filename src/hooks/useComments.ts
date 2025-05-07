/**
 * コメント一覧の取得・表示を管理するReact Hook
 */
import { useCallback, useEffect, useState } from 'react';
import { getComments } from '../api/comment';
import { CommentInfo, CommentsState } from '../types';

/**
 * 記事に対するコメントを取得・表示するカスタムフック
 * @param articleUri 記事投稿のURI（省略時は取得しない）
 * @param autoFetch 自動的に取得するかどうか（デフォルト: true）
 * @param refetchInterval 自動更新の間隔（ミリ秒、0の場合は自動更新しない）
 * @returns コメント関連の状態と関数
 */
export const useComments = (
  articleUri?: string,
  autoFetch: boolean = true,
  refetchInterval: number = 0
) => {
  // コメント一覧の状態を管理
  const [commentsState, setCommentsState] = useState<CommentsState>({
    comments: [],
    loading: false,
  });

  /**
   * コメントを取得する
   */
  const fetchComments = useCallback(async () => {
    if (!articleUri) return;

    setCommentsState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const comments = await getComments(articleUri);

      // 最新の投稿が先頭に来るようにソート
      const sortedComments = [...comments].sort(
        (a, b) => new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime()
      );

      setCommentsState({
        comments: sortedComments,
        loading: false,
      });
    } catch (error) {
      setCommentsState({
        comments: [],
        loading: false,
        error: error instanceof Error ? error.message : 'コメント取得中にエラーが発生しました',
      });
    }
  }, [articleUri]);

  // 自動取得の設定
  useEffect(() => {
    // URIがない場合や自動取得が無効の場合は何もしない
    if (!articleUri || !autoFetch) return;

    // 初回取得
    fetchComments();

    // 定期的な更新が設定されている場合
    if (refetchInterval > 0) {
      const intervalId = setInterval(fetchComments, refetchInterval);
      return () => clearInterval(intervalId);
    }
  }, [articleUri, autoFetch, refetchInterval, fetchComments]);

  /**
   * 特定のコメントを追加する（投稿直後の表示用）
   */
  const addComment = useCallback((comment: CommentInfo) => {
    setCommentsState(prev => ({
      ...prev,
      comments: [comment, ...prev.comments],
    }));
  }, []);

  return {
    ...commentsState,
    fetchComments,
    addComment,
  };
};
