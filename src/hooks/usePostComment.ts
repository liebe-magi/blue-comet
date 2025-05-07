/**
 * コメント投稿機能を管理するReact Hook
 */
import { useCallback, useState } from 'react';
import { postComment } from '../api/comment';
import { CommentInfo, PostCommentState } from '../types';

/**
 * 記事にコメントを投稿するためのカスタムフック
 * @returns コメント投稿関連の状態と関数
 */
export const usePostComment = () => {
  // コメント投稿の状態を管理
  const [state, setState] = useState<PostCommentState>({
    posting: false,
    success: false,
  });

  /**
   * コメントを投稿する
   * @param articleUri 記事投稿のURI
   * @param articleCid 記事投稿のCID
   * @param commentText コメントのテキスト
   * @returns 投稿結果
   */
  const submitComment = useCallback(
    async (
      articleUri: string,
      articleCid: string,
      commentText: string
    ): Promise<CommentInfo | null> => {
      setState({ posting: true, success: false });

      try {
        const result = await postComment(articleUri, articleCid, commentText);

        // コメント情報を作成（Blueskyから完全な情報を取得するわけではないので一部推測）
        const now = new Date().toISOString();
        const commentInfo: CommentInfo = {
          uri: result.uri,
          cid: result.cid,
          text: commentText,
          author: {
            // 注: ここでのDIDとハンドルは実際にはセッションから取得する必要がある
            // 簡略化のため、ここでは投稿が成功した時点でログイン済みと仮定
            did: 'logged-in-did', // 実際の実装では動的に取得
            handle: 'logged-in-handle', // 実際の実装では動的に取得
          },
          createdAt: now,
          indexedAt: now,
        };

        setState({ posting: false, success: true });
        return commentInfo;
      } catch (error) {
        setState({
          posting: false,
          success: false,
          error: error instanceof Error ? error.message : 'コメント投稿中にエラーが発生しました',
        });
        return null;
      }
    },
    []
  );

  /**
   * 状態をリセットする
   */
  const reset = useCallback(() => {
    setState({ posting: false, success: false });
  }, []);

  return {
    ...state,
    submitComment,
    reset,
  };
};
