# Blue Comet · Next.js example

A minimal Next.js 16 App Router blog wired up to Blue Comet. Posts are MDX files under `posts/`; each article's `bluesky:` frontmatter key points at the Bluesky post that hosts its comments.

## Run

```sh
# From the blue-comet repo root, build the library so file:../.. resolves.
bun run build

# Then in this directory:
cd examples/nextjs
bun install
bun dev
```

Open <http://localhost:3000>.

## Linking an article to Bluesky

Out of the box, `posts/sample.mdx` has **no** `bluesky:` key, so the post page renders the "Comments not yet linked" fallback. To wire it up:

```sh
# One-time: save your Bluesky handle and an app password locally.
bunx blue-comet bluecomet login

# For each article: post to Bluesky and write the URI back into frontmatter.
# `bluecomet.config.json` already supplies the file glob and template.
bunx blue-comet bluecomet link --dry-run    # preview
bunx blue-comet bluecomet link              # actually post
```

After the link command, `posts/sample.mdx` will gain a line like:

```yaml
bluesky: 'at://did:plc:.../app.bsky.feed.post/...'
```

Reload the post page and you should see the live thread, plus a "Reply on Bluesky" button.

## What's interesting in this example

- **`app/posts/[slug]/page.tsx`** — server component that reads MDX, renders the body via `next-mdx-remote/rsc`, and slots in `<BlueCometComments postUri={post.bluesky} />` after the article. Falls back to a CTA when the URI is missing.
- **`lib/posts.ts`** — gray-matter-based reader. `bluesky` is just one optional frontmatter field among the usual `title` / `date` / `description`.
- **`bluecomet.config.json`** — the CLI reads this for default flags, so `bluecomet link` works without any flags from the project root.

## Going to production

- Set `textTemplate` to use whatever frontmatter keys you actually have. Tokens are substituted directly from frontmatter; only `{{slug}}` (filename without extension) and `{{filename}}` are built in.
- The CLI uses an **app password** (https://bsky.app/settings/app-passwords). Never use your account password.
- Once an article has a `bluesky:` URI, re-running `bluecomet link` is a no-op (the CLI defaults to `--skip-existing`).
