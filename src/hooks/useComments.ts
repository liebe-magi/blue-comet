/**
 * React Hook for managing comment listing and display
 */
import { useCallback, useEffect, useState } from 'react';
import { getComments } from '../api/comment';
import { CommentInfo, CommentsState } from '../types';

/**
 * Custom hook for retrieving and displaying comments for an article
 * @param articleUri Article post URI (omit to not fetch)
 * @param autoFetch Whether to fetch automatically (default: true)
 * @param refetchInterval Auto-refresh interval (milliseconds, 0 for no auto-refresh)
 * @returns Comment-related states and functions
 */
export const useComments = (
  articleUri?: string,
  autoFetch: boolean = true,
  refetchInterval: number = 0
) => {
  // Manage comments list state
  const [commentsState, setCommentsState] = useState<CommentsState>({
    comments: [],
    loading: false,
  });

  /**
   * Fetch comments
   */
  const fetchComments = useCallback(async () => {
    if (!articleUri) return;

    setCommentsState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const comments = await getComments(articleUri);

      // Sort with newest posts first
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
        error: error instanceof Error ? error.message : 'An error occurred while fetching comments',
      });
    }
  }, [articleUri]);

  // Auto-fetch setup
  useEffect(() => {
    // Do nothing if no URI or auto-fetch is disabled
    if (!articleUri || !autoFetch) return;

    // Initial fetch
    fetchComments();

    // Set up periodic refresh if interval is specified
    if (refetchInterval > 0) {
      const intervalId = setInterval(fetchComments, refetchInterval);
      return () => clearInterval(intervalId);
    }
  }, [articleUri, autoFetch, refetchInterval, fetchComments]);

  /**
   * Add a specific comment (for display after posting)
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
