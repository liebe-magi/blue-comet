import Link from 'next/link';
import { getAllPosts } from '../lib/posts';

export default function HomePage() {
  const posts = getAllPosts();
  return (
    <main>
      <h1>Blue Comet · Next.js example</h1>
      <p>
        Drop-in Bluesky-backed comments for an MDX blog. The CLI{' '}
        <code>bluecomet link</code> creates a Bluesky post per article and writes the resulting{' '}
        <code>at://</code> URI back into the article's frontmatter.
      </p>

      <h2>Posts</h2>
      <ul>
        {posts.map(post => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            {post.date ? <span className="post-meta"> — {post.date}</span> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
