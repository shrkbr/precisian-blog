# Precisian Blog

Technical blog for [Precisian](https://precisian.io) — AI-powered GA4 data integrity platform by Nação Digital.

**Live:** https://precisian.io/blog

## Stack

- [Astro 6](https://astro.build) (static site generator)
- TypeScript (strict)
- Tailwind CSS + @tailwindcss/typography
- MDX via `@astrojs/mdx`
- Multi-language: `pt-BR` (default) + `en`
- LLM-ready: `llms.txt`, raw markdown endpoints, schema.org JSON-LD, robots.txt allowlist on main site

## Local development

```bash
npm install
npm run dev
# → http://localhost:4321/blog/pt-BR/
```

## Build

```bash
npm run build
# → dist/ contains static site
```

## Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

Unit tests cover `src/i18n/utils.ts`, `src/lib/posts.ts`, and `src/lib/schema.ts` — 16 tests total.

## Deployment

### Manual deploy

```bash
./scripts/deploy.sh
# rsyncs dist/ → VPS Nação
```

Requires SSH key configured for `nacaodigital@precisian.io`. Environment variables `VPS_USER`, `VPS_HOST`, `REMOTE_DIR` can override the defaults.

### Automatic deploy (future)

Articles added via ContentMaster are committed directly to `main` via GitHub API. A post-receive hook or GitHub Actions workflow can trigger `git pull && npm ci && npm run build` on the VPS.

## Content

Articles live in `src/content/posts/{pt-BR,en}/`. Frontmatter must match the Zod schema in `src/content.config.ts`.

Required fields:
- `title`, `description`, `slug`, `lang`, `translationKey`, `publishedAt`, `tags`

`translationKey` links pt-BR and en versions of the same article for the language switcher.

## LLM-readiness

- `/blog/llms.txt` — curated index (fast.ai proposal)
- `/blog/llms-full.txt` — full content dump for bulk ingestion
- `/blog/posts/<slug>.md` — raw markdown for each article
- Schema.org `BlogPosting` JSON-LD in every article
- `robots.txt` at the site root (`precisian.io/robots.txt`) allowlists GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Anthropic-AI, CCBot

## Spec and Plan

- **Design spec:** `docs/superpowers/specs/2026-04-13-precisian-blog-design.md` (ContentMaster repo)
- **Implementation plan:** `docs/superpowers/plans/2026-04-13-precisian-blog.md` (ContentMaster repo)

## ContentMaster integration

The ContentMaster system contains a `blog-publisher` service that commits approved article drafts directly to this repo via the GitHub API. See the spec above for the full design.

## License

All rights reserved © Nação Digital
