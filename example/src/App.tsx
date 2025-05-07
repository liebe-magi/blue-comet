import {
  ArticleInfo,
  BlueskyAuthCredentials,
  useArticlePost,
  useBlueskyAuth,
  useComments,
  usePostComment,
} from 'blue-comet';
import React, { useState } from 'react';

// サンプル記事情報
const sampleArticle: ArticleInfo = {
  articleId: 'sample-article-001',
  title: 'Blue Comet サンプル記事',
  url: 'https://example.com/sample-article-001',
};

const App: React.FC = () => {
  // 認証状態
  const { authState, login, logout } = useBlueskyAuth();

  // 記事投稿状態
  const {
    articlePostResult,
    postArticleReference,
    findArticleReference,
    loading: articleLoading,
    error: articleError,
  } = useArticlePost();

  // コメント一覧
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    fetchComments,
    addComment,
  } = useComments(articlePostResult?.uri);

  // コメント投稿
  const { posting, success, error: postError, submitComment } = usePostComment();

  // 認証情報フォーム用の状態
  const [credentials, setCredentials] = useState<BlueskyAuthCredentials>({
    identifier: '',
    password: '',
  });

  // コメント投稿フォーム用の状態
  const [commentText, setCommentText] = useState('');

  // 認証フォームの送信ハンドラー
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(credentials);
  };

  // 記事参照用投稿の作成ハンドラー
  const handleCreateArticlePost = async () => {
    await postArticleReference(sampleArticle);
  };

  // 記事参照用投稿の検索ハンドラー
  const handleFindArticlePost = async () => {
    await findArticleReference(sampleArticle.articleId);
  };

  // コメント投稿ハンドラー
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!articlePostResult || !commentText.trim()) return;

    const comment = await submitComment(articlePostResult.uri, articlePostResult.cid, commentText);

    if (comment) {
      addComment(comment);
      setCommentText('');
    }
  };

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="container">
      <h1>Blue Comet サンプルアプリ</h1>

      {/* 認証セクション */}
      <div className="card">
        <h2>Blueskyアカウント認証</h2>
        {authState.isAuthenticated ? (
          <div>
            <p>ログイン済み: {authState.handle}</p>
            <button onClick={logout}>ログアウト</button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="identifier">ユーザー名:</label>
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
              <label htmlFor="password">パスワード:</label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="アプリパスワードを推奨"
                required
              />
            </div>
            <button type="submit" disabled={authState.loading}>
              {authState.loading ? 'ログイン中...' : 'ログイン'}
            </button>
            {authState.error && <p className="error">{authState.error}</p>}
          </form>
        )}
      </div>

      {/* 記事投稿セクション */}
      <div className="card">
        <h2>記事参照用投稿</h2>
        <p>記事ID: {sampleArticle.articleId}</p>
        <p>タイトル: {sampleArticle.title}</p>
        <p>URL: {sampleArticle.url}</p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={handleCreateArticlePost}
            disabled={!authState.isAuthenticated || articleLoading}
          >
            記事参照用投稿を作成
          </button>
          <button onClick={handleFindArticlePost} disabled={articleLoading}>
            記事参照用投稿を検索
          </button>
        </div>

        {articleLoading && <p>処理中...</p>}
        {articleError && <p className="error">{articleError}</p>}

        {articlePostResult && (
          <div style={{ marginTop: '1rem' }}>
            <p className="success">記事参照用投稿が見つかりました:</p>
            <p>URI: {articlePostResult.uri}</p>
            <p>CID: {articlePostResult.cid}</p>
          </div>
        )}
      </div>

      {/* コメント投稿セクション */}
      {articlePostResult && (
        <div className="card">
          <h2>コメント投稿</h2>
          <form onSubmit={handlePostComment}>
            <div className="form-group">
              <label htmlFor="comment">コメント:</label>
              <textarea
                id="comment"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="コメントを入力してください"
                rows={3}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!authState.isAuthenticated || posting || !commentText.trim()}
            >
              {posting ? '投稿中...' : 'コメントを投稿'}
            </button>
            {postError && <p className="error">{postError}</p>}
            {success && <p className="success">コメントが投稿されました！</p>}
          </form>
        </div>
      )}

      {/* コメント一覧セクション */}
      {articlePostResult && (
        <div className="card">
          <h2>コメント一覧</h2>
          <button onClick={() => fetchComments()} disabled={commentsLoading}>
            {commentsLoading ? '読み込み中...' : 'コメントを更新'}
          </button>

          {commentsError && <p className="error">{commentsError}</p>}

          <div className="comment-list" style={{ marginTop: '1rem' }}>
            {comments.length === 0 ? (
              <p>コメントはまだありません。</p>
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
