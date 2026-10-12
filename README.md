# LluckyGames

Game design portfolio of **Lluc Sansaloni** — systems & economies, taken
apart and built from scratch.

> We take games apart. Then we build them.

## What lives here

| Path | What |
| --- | --- |
| `site/` | The portfolio website — Astro + MDX, static, deployed to GitHub Pages |
| `games/rock-paper-magic/` | Playable prototype: RPS combat resolver (Vite + TypeScript, no engine) |
| `.github/workflows/` | CI: builds the site and deploys to GitHub Pages on push to `main` |

## Site

```bash
cd site
npm install
npm run dev        # http://localhost:4321/llucky-games/
npm run build      # static output in site/dist
```

- **Writing** — article collection lives in `site/src/content/articles/` as
  `.mdx` files. To publish: write the file with frontmatter
  (`title`, `description`, `pubDate`, `tags`, `draft`), then flip
  `draft: false`. Drafts are excluded from the production build.
- **Projects** — static pages in `site/src/pages/projects/`.
- **Base path** — the site is configured for a GitHub Pages *project* site at
  `/llucky-games/` (`site/astro.config.mjs`). If you rename the repo, update
  `site` + `base` there.

## Game: Rock Paper Magic

```bash
cd games/rock-paper-magic
npm install
npm run dev        # local dev
npm run build      # emits games/rock-paper-magic/dist/
```

Design brief: see the project page on the site, or
`games/rock-paper-magic/README.md`. The build is meant to be embedded in the
site as an iframe once ready.

## Deploy

Push to `main` → GitHub Actions builds `site/` and deploys to GitHub Pages.
One-time setup on GitHub: **Settings → Pages → Source: GitHub Actions**.

If you later buy a custom domain: add a `CNAME`, set `site:` in
`site/astro.config.mjs` to the domain and `base: '/'`.

## Roadmap

- [x] Phase 0 — scaffold, identity, empty-but-alive site
- [ ] Phase 1 — article 1 published (LoL RP economy — draft exists, fact-check pass pending)
- [ ] Phase 2 — Rock Paper Magic playable, embedded on its project page
- [ ] Phase 3 — WoW Token + Warframe articles; balance devlog for the game
- [ ] Phase 4 — career-ops connection (Game Designer archetype, CV variant) — optional
