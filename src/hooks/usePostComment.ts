/**
 * React Hook for managing comment posting functionality
 */
import { useCallback, useState } from 'react';
import { postComment } from '../api/comment';
import { CommentInfo, PostCommentState } from '../types';

/**
 * Custom hook for posting comments to an article
 * @returns Comment posting related states and functions
 */
export const usePostComment = () => {
  // Manage comment posting state
  const [state, setState] = useState<PostCommentState>({
    posting: false,
    success: false,
  });

  /**
   * Post a comment
   * @param articleUri Article post URI
   * @param articleCid Article post CID
   * @param commentText Comment text
   * @returns Posting result
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

        // Create comment info (some parts are estimated as we don't retrieve the full info from Bluesky)
        const now = new Date().toISOString();
        const commentInfo: CommentInfo = {
          uri: result.uri,
          cid: result.cid,
          text: commentText,
          author: {
            // Note: DID and handle should actually be retrieved from the session
            // For simplicity, we assume the user is logged in when the post succeeds
            did: 'logged-in-did', // Should be dynamically retrieved in actual implementation
            handle: 'logged-in-handle', // Should be dynamically retrieved in actual implementation
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
          error:
            error instanceof Error ? error.message : 'An error occurred while posting the comment',
        });
        return null;
      }
    },
    []
  );

  /**
   * Reset state
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
