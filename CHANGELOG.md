# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0-alpha.0 — 2026-05-07

Full rewrite. **Breaking: nothing in `0.1.x` is preserved** — public API, package layout, and authentication model have all changed.

### Added

- `<BlueCometComments postUri="at://..." />` — drop-in component that fetches a Bluesky thread from the public AppView (`https://public.api.bsky.app`) and renders nested replies. Read-only by design; replying redirects to Bluesky.
- Headless hooks `useThread(uri)` and `useCommentCount(uri)` for custom rendering and count badges. Discriminated-union result types; abort on unmount; `refetchInterval` and `enabled` options.
- Direct fetchers `fetchThread` and `fetchThreadCount` for SSR / SSG / server components.
- URI helpers: `parseAtUri`, `parseBlueskyWebUrl`, `buildBlueskyPostUrl`, `buildReplyComposerUrl`, `webUrlToAtUri`.
- Optional default stylesheet at `blue-comet/styles.css` driven by CSS custom properties (`--bluecomet-*`).
- `bluecomet` CLI with four subcommands:
  - `login` / `logout` — saves a handle + Bluesky app password to `~/.bluecomet/credentials.json` (chmod 600).
  - `post` — atomic primitive; takes `--text` or `--stdin`, prints URI (or `--json`).
  - `link <files...>` — reads MDX/Markdown frontmatter, posts via templated text, writes the resulting URI back into the file. Supports `--dry-run`, `--skip-existing` (default), `--force`, `--frontmatter-key`, `--text-template`, `--concurrency`, `--lang`, and a `bluecomet.config.{json,mjs,js}` for project defaults.
- Post bodies are sent with **RichText facets** so URLs / @mentions / #hashtags render as clickable spans on Bluesky, and an **OGP embed card** is attached automatically (via `cardyb.bsky.app`) when the body contains a URL — matching the look of the official Bluesky web client.
- `examples/vite/` — minimal SPA showcasing the simplest integration.
- `examples/nextjs/` — Next.js 16 App Router + MDX + frontmatter-driven URI + CLI integration.

### Changed (vs 0.1.x — effectively a green-field design)

- Auth model: in-blog login is **gone**. The runtime never authenticates; the CLI is the only place that does (with an app password, locally).
- Article ↔ Bluesky-post mapping: `searchPosts` is **gone**. Mapping lives explicitly in frontmatter.
- Bundler: `tsup` (was `rollup`).
- Test framework: `vitest` (was `jest`).
- CLI library: `commander`.
- Package manager: `bun`.
- Peer dependency: React `>=18` (was `>=16.8`); `engines.node >=18.17`.

### Architecture goals achieved

- React entry: **4.4 KB gzipped** (target was <10 KB).
- React entry does **not** import `@atproto/api`; the heavy SDK lives only in the CLI dist entry.
- SSR-safe: no module-level `localStorage` access, no top-level singletons, `'use client'` directive emitted for the React entry.
