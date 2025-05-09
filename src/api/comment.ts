/**
 * API operations module for comment-related functions
 */
import { AppBskyFeedDefs } from '@atproto/api';
import { CommentInfo } from '../types';
import { logger } from '../utils';
import { blueskyAgent } from './agent';

/**
 * Post a comment to an article
 * @param articleUri Article post URI
 * @param articleCid Article post CID
 * @param commentText Comment text
 * @returns Posting result
 */
export const postComment = async (
  articleUri: string,
  articleCid: string,
  commentText: string
): Promise<{ uri: string; cid: string }> => {
  const agent = blueskyAgent.getAgent();

  if (!blueskyAgent.isSessionValid()) {
    throw new Error('Not authenticated. Please login.');
  }

  // Post the comment as a reply to the article post
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
    langs: ['en'],
    createdAt: new Date().toISOString(),
  });

  return {
    uri: response.uri,
    cid: response.cid,
  };
};

/**
 * Get comments for an article
 * @param articleUri Article post URI
 * @returns List of comments
 */
export const getComments = async (articleUri: string): Promise<CommentInfo[]> => {
  const agent = blueskyAgent.getAgent();

  try {
    // Get the thread of the post (including replies)
    const threadResponse = await agent.getPostThread({
      uri: articleUri,
      depth: 1, // Only get direct replies
    });

    // Check the thread type (whether it's ThreadViewPost)
    if (AppBskyFeedDefs.isThreadViewPost(threadResponse.data.thread)) {
      // Get replies if it's ThreadViewPost
      const replies = threadResponse.data.thread.replies || [];

      // Convert to comment information
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

    // Return an empty array if it's not ThreadViewPost
    return [];
  } catch (error) {
    logger.error('An error occurred while retrieving comments:', error);
    return [];
  }
};
