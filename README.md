# Blue Comet

![Blue Comet Logo](res/icon_256.png)

Blue Comet is a React Hooks library designed to implement a blog comment system using Bluesky.
It enables comment functionality for blogs and other platforms by leveraging Bluesky posts.

## Features

- Manage comments for each article as Bluesky posts (replies)
- Authentication and posting using Bluesky accounts
- Create and manage article reference posts
- Retrieve and display comments
- Type-safe API with TypeScript

## Installation

```bash
# npm
npm install blue-comet

# yarn
yarn add blue-comet

# pnpm
pnpm add blue-comet
```

## Usage

### Prerequisites

- You need a Bluesky account.
- You need an account for article management and user accounts for commenting.

### Basic Usage

#### 1. Authentication

```tsx
import { useBlueskyAuth } from 'blue-comet';

function AuthComponent() {
  const { authState, login, logout } = useBlueskyAuth();

  const handleLogin = async () => {
    await login({
      identifier: 'yourname.bsky.social',
      password: 'your-app-password',
    });
  };

  return (
    <div>
      {authState.isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

#### 2. Creating Article Reference Posts (For Administrators)

```tsx
import { useArticlePost } from 'blue-comet';

function ArticlePostComponent() {
  const { postArticleReference, articlePostResult } = useArticlePost();

  const handleCreateArticlePost = async () => {
    await postArticleReference({
      articleId: 'unique-article-id',
      title: 'Article Title',
      url: 'https://yourblog.com/post-url',
    });
  };

  return (
    <div>
      <button onClick={handleCreateArticlePost}>Create Article Reference</button>
      {articlePostResult && <div>Post Success: {articlePostResult.uri}</div>}
    </div>
  );
}
```

#### 3. Retrieving and Displaying Comments

```tsx
import { useComments } from 'blue-comet';

function CommentsListComponent({ articleUri }) {
  const { comments, loading, error, fetchComments } = useComments(articleUri);

  return (
    <div>
      <button onClick={fetchComments}>Refresh Comments</button>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      <div>
        {comments.map(comment => (
          <div key={comment.cid}>
            <p>
              {comment.author.handle}: {comment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4. Posting Comments

```tsx
import { usePostComment } from 'blue-comet';

function PostCommentComponent({ articleUri, articleCid }) {
  const { submitComment, posting, success, error } = usePostComment();
  const [commentText, setCommentText] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    await submitComment(articleUri, articleCid, commentText);
    if (success) setCommentText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={commentText} onChange={e => setCommentText(e.target.value)} />
      <button type="submit" disabled={posting}>
        {posting ? 'Posting...' : 'Post Comment'}
      </button>
      {error && <p>Error: {error}</p>}
    </form>
  );
}
```

## Provided Hooks

### useBlueskyAuth

A hook for managing Bluesky account authentication.

```tsx
const {
  authState, // Authentication state
  login, // Login function
  logout, // Logout function
  checkSession, // Session check function
} = useBlueskyAuth();
```

### useArticlePost

A hook for creating and managing article reference posts.

```tsx
const {
  articlePostResult, // Article post result
  postArticleReference, // Function to create article reference post
  findArticleReference, // Function to find post by article ID
  loading, // Loading state
  error, // Error information
} = useArticlePost();
```

### useComments

A hook for retrieving and displaying comments for an article.

```tsx
const {
  comments, // Comment list
  loading, // Loading state
  error, // Error information
  fetchComments, // Function to fetch comments
  addComment, // Function to add comment (for local updates)
} = useComments(articleUri, autoFetch, refetchInterval);
```

### usePostComment

A hook for posting comments.

```tsx
const {
  posting, // Posting state
  success, // Success state
  error, // Error information
  submitComment, // Function to submit comment
  reset, // Function to reset state
} = usePostComment();
```

## Sample Application

There is a sample application in the `example` directory of this project. To run it locally, follow these steps:

```bash
# Build the library
pnpm build

# Navigate to the sample app directory
cd example

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

## License

MIT

## Developer Information

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/liebe-magi/blue-comet.git
cd blue-comet

# Install dependencies
pnpm install

# Build
pnpm build
```

### Directory Structure

```
blue-comet/
├── src/              # Source code
│   ├── api/          # Bluesky API integration
│   ├── hooks/        # React hooks
│   ├── types/        # Type definitions
│   └── index.ts      # Entry point
├── example/          # Sample application
├── package.json      # Package information
└── README.md         # Documentation
```

## Important Notes

- This library uses the Bluesky API, so please comply with Bluesky's terms of service.
- Users are responsible for posting appropriate content.
- Please handle Bluesky authentication information securely. Using app passwords is recommended.
