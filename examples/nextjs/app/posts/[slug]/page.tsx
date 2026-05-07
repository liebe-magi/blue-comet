import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { BlueCometComments } from 'blue-comet';
import { getAllPostSlugs, getPost } from '../../../lib/posts';

interface Params {
  slug: string;
}

export function generateStaticParams(): Params[] {
  return getAllPostSlugs().map(slug => ({ slug }));
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  let post;
  try {
    post = getPost(slug);
  } catch {
    notFound();
  }

  return (
    <main>
      <p>
        <Link href="/">← Back to all posts</Link>
      </p>
      <article>
        <h1>{post.title}</h1>
        {post.date ? <p className="post-meta">{post.date}</p> : null}
        <MDXRemote source={post.content} />
      </article>

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
      <h2>Comments</h2>

      {post.bluesky ? (
        <BlueCometComments postUri={post.bluesky} />
      ) : (
        <p className="unlinked-cta">
          Comments are not yet linked for this post. Run{' '}
          <code>bluecomet link posts/{post.slug}.mdx</code> to create the Bluesky thread, or reply
          on Bluesky directly once it exists.
        </p>
      )}
    </main>
  );
}
