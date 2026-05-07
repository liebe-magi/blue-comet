# Blue Comet · Vite example

Minimal demo of `<BlueCometComments />` in a plain React SPA. No CLI, no frontmatter, no auth — just drop the component in with an `at://` post URI.

## Run

```sh
# From the blue-comet repo root
bun run build           # build the library so file:../.. resolves to a real dist/

# Then in this directory
cd examples/vite
bun install
bun dev
```

Open <http://localhost:5173>.

## What to look at

- `src/App.tsx` — renders `<BlueCometComments postUri="at://..." />`. Replace `POST_URI` with a real published Bluesky post to see real comments.
- `src/main.tsx` — imports `blue-comet/styles.css` for the optional default skin.

## Customizing the look

The component accepts a `classNames` prop that maps to every internal element. See the top-level `README.md` for the full list. You can also pass `emptyContent`, `loadingContent`, `errorContent`, or `renderComment` to take over individual states.
