/**
 * Blue Cometの型定義
 */

/**
 * 認証情報の型定義
 */
export interface BlueskyAuthCredentials {
  identifier: string; // Blueskyのユーザー名（例: username.bsky.social）
  password: string; // Blueskyのパスワードまたはアプリパスワード
}

/**
 * 認証状態の型定義
 */
export interface BlueskyAuthState {
  isAuthenticated: boolean; // 認証状態
  did?: string; // 認証されたユーザーのDID
  handle?: string; // 認証されたユーザーのハンドル
  error?: string; // エラーメッセージ
  loading: boolean; // ローディング状態
}

/**
 * 記事情報の型定義
 */
export interface ArticleInfo {
  articleId: string; // 記事のID
  title: string; // 記事のタイトル
  url?: string; // 記事のURL
}

/**
 * 記事投稿結果の型定義
 */
export interface ArticlePostResult {
  uri: string; // 投稿のURI（ATプロトコル形式）
  cid: string; // 投稿のCID
  articleId: string; // 記事のID
}

/**
 * コメント情報の型定義
 */
export interface CommentInfo {
  uri: string; // コメントのURI
  cid: string; // コメントのCID
  text: string; // コメントのテキスト
  author: {
    did: string; // 投稿者のDID
    handle: string; // 投稿者のハンドル
    displayName?: string; // 投稿者の表示名
    avatar?: string; // 投稿者のアバターURL
  };
  createdAt: string; // 作成日時（ISO形式）
  indexedAt: string; // インデックス登録日時（ISO形式）
}

/**
 * コメント取得状態の型定義
 */
export interface CommentsState {
  comments: CommentInfo[]; // コメント一覧
  loading: boolean; // ローディング状態
  error?: string; // エラーメッセージ
}

/**
 * コメント投稿状態の型定義
 */
export interface PostCommentState {
  posting: boolean; // 投稿中状態
  success: boolean; // 成功状態
  error?: string; // エラーメッセージ
}
