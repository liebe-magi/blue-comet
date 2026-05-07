import { BlueCometComments } from 'blue-comet';

// Replace with the at:// URI of any public Bluesky post you'd like to use as
// the comment thread root. The CLI (`bluecomet post` or `bluecomet link`) is
// the easy way to create one for your articles.
const POST_URI = 'at://did:plc:placeholder-replace-me/app.bsky.feed.post/replaceme';

export function App() {
  return (
    <main
      style={{
        maxWidth: '720px',
        margin: '4rem auto',
        padding: '0 1rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1>Blue Comet · minimal SPA example</h1>
      <p>
        This page renders <code>{'<BlueCometComments />'}</code> against a hard-coded post URI. No
        frontmatter, no CLI, no auth. Calls go directly to the public Bluesky AppView.
      </p>
      <p style={{ color: '#888', fontSize: '0.875rem' }}>
        The default URI is a placeholder, so the component below will render its error fallback.
        Open <code>src/App.tsx</code> and replace <code>POST_URI</code> with a real{' '}
        <code>at://</code> URI to see real comments.
      </p>
      <hr />
      <BlueCometComments postUri={POST_URI} />
    </main>
  );
}
