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

**You do not deploy. You push to `main` and the server publishes.**

Since 2026-09-22 the VPS runs a systemd timer (`blog-autodeploy.timer`) that,
every 5 minutes, pulls `main`, builds, and promotes `dist/`. A post merged into
`main` is live at https://precisian.io/blog within ~5 minutes.

### The publish gate — read this before writing a post

The build runs `astro check` and **refuses to publish if the content does not
match the schema**. When that happens the previous version of the site stays up
and an alert goes to the maintainer's WhatsApp — **you will not see an error on
your side**. Your commit sits in `main`, green, and the post never appears.

So validate locally before pushing:

```bash
npm run build     # = astro check && astro build
```

The limits that actually bite (full schema: `src/content.config.ts`):

| Field | Rule |
|---|---|
| `title` | 10–100 characters |
| `description` | **50–160 characters** |
| `slug` | kebab-case, must match the filename |
| `lang` | `pt-BR` or `en` |
| `translationKey` | required — links the pt-BR and en versions |
| `publishedAt` | a date; **not** `pubDate` |
| `tags` | 1 to 8 |

A 162-character `description` is what kept this repo from building on a clean
clone until 2026-09-22, so the 160 limit is not theoretical.

### Manual deploy — superseded, do not use

`scripts/deploy.sh` rsyncs a locally built `dist/` to the VPS. It predates the
automatic publish and is kept only for emergencies. **Running it now races the
timer**: both write the same `dist/`, and whichever finishes last wins, so a
stale local build can silently overwrite the published site. If the timer is
broken, fix the timer.

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
