# Blue Comet

![Blue Comet Logo](res/icon_256.png)

Bluesky-backed comments for your blog. **4.4 KB gzipped**, no auth at runtime, one CLI command to link your articles to a Bluesky thread.

```sh
npm install blue-comet
```

```tsx
import { BlueCometComments } from 'blue-comet';
import 'blue-comet/styles.css';

<BlueCometComments postUri="at://did:plc:.../app.bsky.feed.post/3kxyz..." />
```

That's it. The component fetches the thread from the public Bluesky AppView and renders nested replies. Visitors who want to comment click "Reply on Bluesky" and reply on Bluesky itself.

---

## Why a separate library?

The Bluesky-as-comments space already has [`bluesky-comments`](https://github.com/czue/bluesky-comments) by Cory Zue, which works well. Blue Comet exists because three concrete problems weren't covered:

1. **The runtime React bundle is 4.4 KB gzipped** — the library calls the public AppView via `fetch()` directly. `@atproto/api` (~700 KB minified) lives only inside the CLI, which most users never ship to the browser.

2. **A CLI for linking articles to Bluesky posts.** `bluecomet link posts/*.mdx` reads each article's frontmatter, creates a Bluesky post via templated text, and writes the resulting `at://` URI back into the file. No more copy-pasting URIs from the browser address bar.

3. **First-class theming.** Every internal element has a `classNames` slot, so matching your blog's design system (Tailwind, CSS modules, Mantine, anything) is a one-prop change. Component slots — `emptyContent`, `loadingContent`, `errorContent`, `renderComment` — let you take over individual states without forking.

If those three things don't matter to you, `bluesky-comments` is a great choice and you should use it. If any of them do, read on.

---

## Features

- **Read-only display, redirect to Bluesky for replies.** No OAuth, no app password, no localStorage at runtime. Visitors see the thread; replying happens on Bluesky in their preferred client.
- **SSR / Next.js App Router safe.** The React entry ships with `'use client'`; no module-level `localStorage` reads, no singletons, no hidden state.
- **Threaded replies up to depth 1000** (Bluesky API max).
- **Headless hooks.** `useThread(uri)` and `useCommentCount(uri)` for custom rendering or count badges next to article links.
- **`bluecomet` CLI.** `login` / `logout` / `post` (atomic primitive) / `link` (frontmatter convenience).
- **Works with any frontmatter.** Hugo, Astro, Jekyll, Next.js MDX — any text file `gray-matter` can parse.
- **TypeScript-first.** Discriminated-union hook results, exhaustive types for every prop and slot.

## Quick start

### 1. Install and drop the component in

```tsx
// app/posts/[slug]/page.tsx (or wherever you render your articles)
import { BlueCometComments } from 'blue-comet';
import 'blue-comet/styles.css'; // optional default skin

export default function PostPage({ post }) {
  return (
    <article>
      {/* ...the article body... */}

      {post.bluesky ? (
        <BlueCometComments postUri={post.bluesky} />
      ) : (
        <p>
          Comments not yet linked. <a href="https://bsky.app/profile/yourhandle.bsky.social">Reply on Bluesky</a>.
        </p>
      )}
    </article>
  );
}
```

### 2. Link your articles to Bluesky posts

```sh
# Save credentials locally (chmod 600). Use a Bluesky app password,
# never your account password — https://bsky.app/settings/app-passwords
npx bluecomet login

# For each article, create a Bluesky post and write the resulting URI
# back into the article's frontmatter as `bluesky: at://...`.
npx bluecomet link posts/*.mdx --text-template "{{title}}\n\n{{description}}\n\nhttps://example.com/posts/{{slug}}"
```

After `link`, your frontmatter gains `bluesky: 'at://did:plc:.../app.bsky.feed.post/...'`, and the component above starts rendering real comments.

## API reference

### `<BlueCometComments />`

| Prop | Type | Description |
|---|---|---|
| `postUri` | `string` (required) | `at://` URI of the Bluesky post that hosts the thread. |
| `depth` | `number` | Max nesting depth to fetch. Default `6`, clamped to `1000`. |
| `appviewUrl` | `string` | Override the AppView base URL (defaults to `https://public.api.bsky.app`). |
| `className` | `string` | Class on the root `<section>`. |
| `classNames` | `BlueCometCommentsClassNames` | Per-element class slots. See below. |
| `emptyContent` | `ReactNode` | Replaces the empty state entirely. |
| `loadingContent` | `ReactNode` | Replaces the loading skeleton. |
| `errorContent` | `(error: Error) => ReactNode` | Replaces the error fallback. |
| `renderComment` | `(comment: Comment) => ReactNode` | Take over individual comment rendering. |
| `replyLabel` | `ReactNode` | Custom label for the "Reply on Bluesky" button. |
| `locale` | `string` | BCP-47 tag passed to `Intl.NumberFormat` and date formatting. |

The `classNames` map covers every internal element:

```ts
{
  root, header, list, item, itemHeader, itemMeta,
  avatar, displayName, handle, date, text,
  replies, replyButton, empty, loading, error
}
```

### Headless hooks

```tsx
import { useThread } from 'blue-comet';

const { status, thread, error, refetch } = useThread(postUri);

if (status === 'success') {
  thread.comments.forEach(c => console.log(c.author.handle, c.text));
}
```

`useThread` returns a discriminated union: `{ status: 'idle' | 'loading' | 'success' | 'error', ... }`. Aborts on unmount, supports `refetchInterval`, `enabled: false` for SSG fallback.

```tsx
import { useCommentCount } from 'blue-comet';

// Lightweight; depth-0 fetch reading post.replyCount.
const { count } = useCommentCount(postUri);
```

### Direct fetchers

For SSR, SSG, or server components:

```ts
import { fetchThread, fetchThreadCount } from 'blue-comet';

const thread = await fetchThread(postUri, { depth: 6 });
```

### URI helpers

```ts
import { parseAtUri, parseBlueskyWebUrl, buildBlueskyPostUrl, webUrlToAtUri } from 'blue-comet';

parseAtUri('at://did:plc:abc/app.bsky.feed.post/xyz');
// { did: 'did:plc:abc', collection: 'app.bsky.feed.post', rkey: 'xyz' }

buildBlueskyPostUrl('at://...', 'alice.bsky.social');
// 'https://bsky.app/profile/alice.bsky.social/post/xyz'

await webUrlToAtUri('https://bsky.app/profile/alice.bsky.social/post/xyz');
// 'at://did:plc:.../app.bsky.feed.post/xyz' (resolves the handle)
```

## CLI reference (`bluecomet`)

### `bluecomet login`

Interactive prompts for handle + app password. Saves to `~/.bluecomet/credentials.json` with mode `0o600`. Override the storage location for tests with `BLUECOMET_CONFIG_DIR=/tmp/...`.

> ⚠️ Always use a [Bluesky app password](https://bsky.app/settings/app-passwords), never your account password.

### `bluecomet logout`

Removes the credentials file.

### `bluecomet post`

The atomic primitive. Creates one Bluesky post and prints the URI.

```sh
bluecomet post --text "New article: My Post — https://example.com/my-post"
# → at://did:plc:.../app.bsky.feed.post/3lkxyz...

echo "..." | bluecomet post --stdin --json
# → {"uri":"at://...","cid":"...","webUrl":"https://bsky.app/..."}
```

URLs / `@mentions` / `#hashtags` in the text are sent with **RichText facets** so they render as clickable spans on Bluesky. When the text contains a URL, an **OGP embed card** (title / description / thumbnail) is attached automatically via [cardyb.bsky.app](https://cardyb.bsky.app), matching the official Bluesky web client's behavior. If cardyb is unreachable or the og:image exceeds Bluesky's 1 MB blob limit the post still goes through, just without the card / thumbnail.

### `bluecomet link <files...>`

Frontmatter-aware convenience. For each file:

1. Read frontmatter with `gray-matter` (works with YAML / TOML / JSON; any extension).
2. If `bluesky:` is already set and `--skip-existing` (default) is on, skip.
3. Render the templated text — `{{title}}`, `{{summary}}`, `{{tags}}`, etc., directly map to frontmatter keys. `{{slug}}` and `{{filename}}` are built-in.
4. Post to Bluesky.
5. Write the URI back into the frontmatter (preserves the body verbatim, including trailing-newline state).

| Flag | Default | Notes |
|---|---|---|
| `--text-template <tpl>` | `"{{title}}\n\n{{description}}"` | Tokens map to frontmatter keys. `\n` and `\t` escapes are expanded. Output truncates to 300 graphemes (Bluesky's cap) using `Intl.Segmenter`. |
| `--frontmatter-key <key>` | `bluesky` | Where to write the resulting URI. |
| `--dry-run` | off | Print the rendered text without posting or writing. |
| `--skip-existing` | on | Skip files that already have the key. |
| `--force` | off | Overwrite existing values. |
| `--config <path>` | auto-detect | Path to a `bluecomet.config.{json,mjs,js}`. |
| `--concurrency <n>` | `1` | Parallel posts. Keep low to respect Bluesky rate limits. |
| `--lang <lang>` | none | Language tag attached to the post record. |

### `bluecomet.config.{json,mjs,js}` (optional)

Project-level defaults, picked up automatically from the working directory:

```jsonc
// bluecomet.config.json
{
  "files": ["posts/*.mdx", "posts/*.md"],
  "frontmatterKey": "bluesky",
  "textTemplate": "{{title}}\n\n{{description}}\n\nhttps://example.com/posts/{{slug}}",
  "concurrency": 1
}
```

With this in place, `bluecomet link` runs flag-free.

## Recipes

### Hugo

```sh
bluecomet link content/posts/*.md \
  --frontmatter-key bsky_uri \
  --text-template "{{title}}\n\nhttps://example.com/{{slug}}"
```

### Astro

```sh
bluecomet link src/content/blog/*.mdx \
  --text-template "{{title}}\n\n{{description}}"
```

### Jekyll

```sh
bluecomet link _posts/*.markdown \
  --frontmatter-key bluesky \
  --text-template "{{title}} {{permalink}}"
```

### Next.js (App Router) + MDX

See [`examples/nextjs/`](examples/nextjs/) for a full working setup. Highlights:

- Frontmatter `bluesky` key written by `bluecomet link`.
- `<BlueCometComments postUri={post.bluesky} />` slotted after the MDX body.
- `next build --webpack` recommended over Turbopack when developing against `file:../..` (Turbopack misreads bun's link symlinks; webpack handles them cleanly).

## Architecture

```
your-site (browser bundle)
    │
    │   import { BlueCometComments } from 'blue-comet'
    │
    └──> blue-comet React entry (4.4 KB gzipped)
              │
              │   fetch()
              ▼
         https://public.api.bsky.app
         /xrpc/app.bsky.feed.getPostThread
```

The React layer never imports `@atproto/api`. AppView responses are normalized via a small hand-written validator. The CLI is a separate dist entry (`dist/cli/`) that *does* depend on `@atproto/api`, but it never reaches the browser bundle.

## Examples

- [`examples/vite/`](examples/vite/) — minimal SPA, hardcoded `postUri`, no CLI.
- [`examples/nextjs/`](examples/nextjs/) — Next.js 16 App Router + MDX + frontmatter-driven URI + `bluecomet link`.

## FAQ

**Why no in-page reply composer?** Bluesky's OAuth flow requires hosting client metadata, redirect URIs, and DPoP-signed tokens — significant complexity for a comment widget. Sending visitors to Bluesky to reply keeps the runtime auth-free and gives them their preferred client.

**Will visitors who don't have Bluesky see anything?** Yes — they see the existing thread normally. The "Reply on Bluesky" button takes them to the post on bsky.app where they can sign up if interested, or just read.

**What about deleted comments?** Deleted Bluesky posts disappear from the thread on the next fetch. There's no soft-delete or moderation layer — you delegate moderation to Bluesky's tools (block, mute, report).

**Bundle size — is the 4.4 KB number really 4.4 KB?** Yes for the ESM entry, after gzip, excluding React. Verify locally with `gzip -c node_modules/blue-comet/dist/index.js | wc -c`.

**Can I migrate from `bluesky-comments`?** Yes. Replace `<BlueskyComments uri={...} />` with `<BlueCometComments postUri={...} />` and run `bluecomet login` if you want to use the CLI for new articles. Existing posts you've already linked manually will continue to work — they're just at:// URIs in your frontmatter.

## License

MIT. See [LICENSE](LICENSE).

## Contributing

Issues and PRs welcome at https://github.com/liebe-magi/blue-comet. Please run `bun run lint && bun run typecheck && bun run test` before submitting.
