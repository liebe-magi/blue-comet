# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project overview

Blue Comet is a React library plus CLI for adding Bluesky-backed comments to a blog. The runtime is **read-only** — comments are fetched from the public Bluesky AppView (no auth) and rendered as a thread; visitors who want to reply are sent to Bluesky itself. The CLI helps authors create the per-article Bluesky post and write its URI back into MDX/Markdown frontmatter.

A 0.1.x experimental version existed previously and has been discarded. The current branch is `v1-rewrite` and targets `1.0.0`.

## Architecture (v1)

- **Runtime React layer** (`src/react/**`, `src/index.ts`): does NOT import `@atproto/api`. It calls `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread` directly via `fetch()`. Goal: keep the React bundle under 10 KB min+gz.
- **Core layer** (`src/core/**`): pure, dependency-free helpers (URI parsing, AppView fetcher, types, errors). Importable from React or Node.
- **CLI layer** (`src/cli/**`): the only place that imports `@atproto/api`. Provides `bluecomet login` / `logout` / `post` / `link`. Stored credentials live in `~/.bluecomet/credentials.json` (chmod 600).
- **Examples** (`examples/vite/`, `examples/nextjs/`): runnable demos; Vite version uses postUri directly, Next.js version uses MDX + CLI.

The CLI primitive is `bluecomet post` (creates a Bluesky post and prints its URI). `bluecomet link <files...>` is a thin convenience that reads frontmatter, runs a templated post, and writes the URI back. Templates substitute frontmatter keys directly (e.g. `{{title}}`, `{{summary}}`); only `{{slug}}` and `{{filename}}` are special.

## Toolchain

- **Package manager**: bun (`bun.lock`).
- **Bundler**: tsup. See `tsup.config.ts` for the three-entry config (React + CLI programmatic + CLI bin).
- **Tests**: vitest with jsdom + msw.
- **Lint/format**: ESLint (flat config) + Prettier.

## Commands

- `bun run build` — produce `dist/` (ESM + CJS for the React entry, ESM for CLI, plus `dist/cli/bin.js` with `0o755`).
- `bun run dev` — tsup watch mode.
- `bun run test` / `bun run test:watch` — vitest.
- `bun run typecheck` — `tsc --noEmit`.
- `bun run lint` / `bun run fix` — ESLint + Prettier.

## Code style

- 2-space indent, single quotes, semicolons, `printWidth: 100`.
- Comments in English.
- Keep `src/core/` dependency-free (no `react`, no `@atproto/api`).
- Keep `src/react/` free of `@atproto/api` imports — the React bundle must not pull it in.
- `src/cli/` is the only place allowed to import Node-only modules and `@atproto/api`.

## Phased work plan

The implementation proceeds in phases (see `.claude/plans/bluesky-eventual-thunder.md` for the full plan). At any moment, only one phase is in progress; subsequent phases are pending.

| Phase | Summary |
|---|---|
| 0 | Clean slate (delete old `src/`, `example/`, configs). |
| 1 | Toolchain + `src/core/{types,errors,uri,appview}.ts` + tests. |
| 2 | `src/react/**` and `src/styles.css`. |
| 3 | `src/cli/**`. |
| 4 | `examples/vite/` and `examples/nextjs/`. |
| 5 | `hacking-frontline` integration (separate repo). |
| 6 | README/CHANGELOG, `npm publish`. |

## Important notes

- Comments display uses **no authentication**. Library never asks visitors to log in.
- The CLI uses an app password (never a Bluesky account password). The README and `bluecomet login` flow must surface this clearly.
- `searchPosts` is intentionally not used — the current API has known bugs (broken cursor pagination, broken OR operator). Article-to-post mapping is explicit via frontmatter.
- The plan file `.claude/plans/bluesky-eventual-thunder.md` is the source of truth for design decisions; consult it before changing architecture.
