# GIFster

**A fast, polished GIF search engine built on the Giphy API.**

> We're not GIPHY, damn it.

[Live demo](https://scottjhetrick.com/gifster/) · Part of the [dreadfolio](https://scottjhetrick.com) monorepo

---

## Features

- **Live search** — debounced search-as-you-type with tag autocomplete
  (arrow-key navigation, `/` to focus from anywhere, `Esc` to clear)
- **Infinite scroll** — paginated feed with request cancellation and
  duplicate-page dedup; the sentinel prefetches well before you hit bottom
- **GIFs + Stickers** — both Giphy libraries, with a checkerboard backdrop for
  transparent stickers
- **Favorites** — heart anything; persisted in `localStorage`, no account
  needed, searchable like the main feed
- **Detail view** — creator card, dimensions, upload date, rating, related
  GIFs, copy link / embed code, direct download
- **Shareable URLs** — `?q=` and `?tab=` mirror app state; back/forward work
- **Surprise me** — random GIF, biased by your current search

## Performance

- **Height-balanced masonry** — Giphy reports dimensions up front, so each gif
  is placed in the currently-shortest column with a CSS `aspect-ratio`
  placeholder: deterministic layout, zero layout shift, no measurement pass
- **Lazy media** — grid `<video>` elements mount just before entering the
  viewport and pause when they leave; offscreen cards are plain still images
- **Small renditions** — the grid streams ~200px MP4s, not originals
- **Cancellation everywhere** — every feed/suggestion/related fetch carries an
  `AbortController`; superseded queries are generation-guarded so stale
  results never land
- **Lean bundle** — 288 kB (94 kB gzip), down from 848 kB: no Firebase, no
  component library, one deduped React runtime

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · Base UI
(`@base-ui/react` — headless dialog with real enter/exit transitions via
`data-starting-style` / `data-ending-style`) · sonner · Giphy API. No
grid/masonry/scroll libraries — the layout, lazy loading, and infinite scroll
are hand-rolled (~1k lines total).

## Development

```bash
# from the monorepo root, with VITE_GIPHY_API_KEY in .env
pnpm --filter gifster dev      # dev server
pnpm --filter gifster build    # production build (base /gifster/)
pnpm --filter gifster preview  # serve the build
```

## Structure

```
src/
├── lib/
│   ├── giphy.ts          # typed API client + rendition helpers
│   └── favorites.ts      # localStorage store (useSyncExternalStore)
├── hooks/
│   ├── use-gif-feed.ts   # paginated feed: abort, dedup, generation guard
│   ├── use-in-view.ts    # IntersectionObserver hook
│   └── use-debounced-value.ts
├── components/
│   ├── masonry-grid.tsx  # height-balanced column layout
│   ├── gif-card.tsx      # lazy video card with hover actions
│   ├── gif-detail-modal.tsx
│   ├── search-bar.tsx    # autocomplete + keyboard shortcuts
│   ├── trending-chips.tsx
│   └── feed-skeleton.tsx
└── app.tsx               # tabs, URL sync, infinite-scroll wiring
```
