import {
  ArticleInfo,
  BlueskyAuthCredentials,
  useArticlePost,
  useBlueskyAuth,
  useComments,
  usePostComment,
} from 'blue-comet';
import React, { useState } from 'react';

// Sample article information
const sampleArticle: ArticleInfo = {
  articleId: 'sample-article-001',
  title: 'Blue Comet Sample Article',
  url: 'https://example.com/sample-article-001',
};

const App: React.FC = () => {
  // Authentication state
  const { authState, login, logout } = useBlueskyAuth();

  // Article post state
  const {
    articlePostResult,
    postArticleReference,
    findArticleReference,
    loading: articleLoading,
    error: articleError,
  } = useArticlePost();

  // Comment list
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    fetchComments,
    addComment,
  } = useComments(articlePostResult?.uri);

  // Comment posting
  const { posting, success, error: postError, submitComment } = usePostComment();

  // State for authentication form
  const [credentials, setCredentials] = useState<BlueskyAuthCredentials>({
    identifier: '',
    password: '',
  });

  // State for comment submission form
  const [commentText, setCommentText] = useState('');

  // Authentication form submission handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  // Handler for creating article reference post
  const handleCreateArticlePost = async () => {
    await postArticleReference(sampleArticle);
  };

  // Handler for searching article reference post
  const handleFindArticlePost = async () => {
    await findArticleReference(sampleArticle.articleId);
  };

  // Comment submission handler
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!articlePostResult || !commentText.trim()) return;

    const comment = await submitComment(articlePostResult.uri, articlePostResult.cid, commentText);

    if (comment) {
      addComment(comment);
      setCommentText('');
    }
  };

  // Date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US');
  };

  return (
    <div className="container">
      <h1>Blue Comet Sample App</h1>

      {/* Authentication Section */}
      <div className="card">
        <h2>Bluesky Account Authentication</h2>
        {authState.isAuthenticated ? (
          <div>
            <p>Logged in as: {authState.handle}</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="identifier">Username:</label>
              <input
                id="identifier"
                type="text"
                value={credentials.identifier}
                onChange={e => setCredentials({ ...credentials, identifier: e.target.value })}
                placeholder="username.bsky.social"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Recommended app password"
                required
              />
            </div>
            <button type="submit" disabled={authState.loading}>
              {authState.loading ? 'Logging in...' : 'Login'}
            </button>
            {authState.error && <p className="error">{authState.error}</p>}
          </form>
        )}
      </div>

      {/* Article Post Section */}
      <div className="card">
        <h2>Article Reference Post</h2>
        <p>Article ID: {sampleArticle.articleId}</p>
        <p>Title: {sampleArticle.title}</p>
        <p>URL: {sampleArticle.url}</p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={handleCreateArticlePost}
            disabled={!authState.isAuthenticated || articleLoading}
          >
            Create Article Reference Post
          </button>
          <button onClick={handleFindArticlePost} disabled={articleLoading}>
            Search Article Reference Post
          </button>
        </div>

        {articleLoading && <p>Loading...</p>}
        {articleError && <p className="error">{articleError}</p>}

        {articlePostResult && (
          <div style={{ marginTop: '1rem' }}>
            <p className="success">Article Reference Post found:</p>
            <p>URI: {articlePostResult.uri}</p>
            <p>CID: {articlePostResult.cid}</p>
          </div>
        )}
      </div>

      {/* Comment Submission Section */}
      {articlePostResult && (
        <div className="card">
          <h2>Comment Submission</h2>
          <form onSubmit={handlePostComment}>
            <div className="form-group">
              <label htmlFor="comment">Comment:</label>
              <textarea
                id="comment"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Please enter your comment"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!authState.isAuthenticated || posting || !commentText.trim()}
            >
              {posting ? 'Loading...' : 'Submit Comment'}
            </button>
            {postError && <p className="error">{postError}</p>}
            {success && <p className="success">Comment submitted successfully!</p>}
          </form>
        </div>
      )}

      {/* Comments Section */}
      {articlePostResult && (
        <div className="card">
          <h2>Comments</h2>
          <button onClick={() => fetchComments()} disabled={commentsLoading}>
            {commentsLoading ? 'Loading...' : 'Update Comments'}
          </button>

          {commentsError && <p className="error">{commentsError}</p>}

          <div className="comment-list" style={{ marginTop: '1rem' }}>
            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              comments.map(comment => (
                <div key={comment.cid} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">
                      {comment.author.displayName || comment.author.handle}
                    </span>
                    <span className="comment-date">{formatDate(comment.indexedAt)}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
