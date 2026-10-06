// precisian-blog/src/lib/sitemap-meta.mjs
//
// Dados que o @astrojs/sitemap nao consegue descobrir sozinho. Arquivo .mjs
// puro porque e importado pelo astro.config.mjs, que roda ANTES do Astro
// existir: aqui nao ha `astro:content`, entao o frontmatter e lido direto.
//
// Dois problemas que isto resolve:
//   1. hreflang de post. A integracao so casa traducoes pelo CAMINHO, e os
//      posts tem slug diferente por idioma (o par e ligado por translationKey).
//      Sem isto nenhum post sai com hreflang no sitemap.
//   2. lastmod. Vem da data do ultimo COMMIT que tocou o arquivo, nao do
//      publishedAt: a maior parte dos posts tem publishedAt no futuro, e
//      lastmod futuro e descartado pelo Google.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const POSTS_DIR = join(ROOT, 'src/content/posts')

function field(frontmatter, name) {
  const m = frontmatter.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, 'm'))
  return m ? m[1].replace(/^["']|["']$/g, '') : undefined
}

function readPosts() {
  const posts = []
  for (const entry of readdirSync(POSTS_DIR, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue
    const file = join(entry.parentPath, entry.name)
    const fm = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!fm) continue
    const slug = field(fm[1], 'slug')
    const lang = field(fm[1], 'lang')
    if (!slug || !lang || field(fm[1], 'draft') === 'true') continue
    posts.push({
      file: relative(ROOT, file),
      slug,
      lang,
      translationKey: field(fm[1], 'translationKey'),
      frontmatterDate: field(fm[1], 'updatedAt') ?? field(fm[1], 'publishedAt'),
    })
  }
  return posts
}

// Uma chamada so de git para todos os arquivos. O log vem do mais novo para o
// mais velho, entao a primeira vez que um arquivo aparece e o ultimo commit dele.
function gitDates() {
  const dates = new Map()
  try {
    const out = execFileSync(
      'git',
      ['log', '--format=%x00%cI', '--name-only', '--', 'src/content/posts'],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
    )
    for (const block of out.split('\0').slice(1)) {
      const [date, ...files] = block.split('\n').filter(Boolean)
      for (const f of files) if (!dates.has(f)) dates.set(f, date)
    }
  } catch {
    // Sem git (tarball, clone raso): cai no frontmatter, abaixo.
  }
  return dates
}

function lastmodOf(post, dates, now) {
  const fromGit = dates.get(post.file)
  if (fromGit) return new Date(fromGit).toISOString()
  // Reserva: a data do frontmatter, mas nunca no futuro.
  const d = post.frontmatterDate ? new Date(post.frontmatterDate) : undefined
  return d && !Number.isNaN(d.getTime()) && d <= now ? d.toISOString() : undefined
}

export function buildSitemapMeta(site, base) {
  const prefix = new URL(`${base.replace(/\/$/, '')}/`, site).toString()
  const posts = readPosts()
  const dates = gitDates()
  const now = new Date()
  const postUrl = (p) => `${prefix}${p.lang}/posts/${p.slug}/`

  const byKey = new Map()
  for (const p of posts) {
    if (!p.translationKey) continue
    if (!byKey.has(p.translationKey)) byKey.set(p.translationKey, [])
    byKey.get(p.translationKey).push(p)
  }

  const byUrl = new Map()
  const newestByLang = new Map()
  for (const p of posts) {
    const lastmod = lastmodOf(p, dates, now)
    const siblings = byKey.get(p.translationKey) ?? []
    byUrl.set(postUrl(p), {
      lastmod,
      // hreflang so quando existe traducao: declaracao unilateral e ignorada.
      links: siblings.length > 1 ? siblings.map((s) => ({ lang: s.lang, url: postUrl(s) })) : [],
    })
    if (lastmod && lastmod > (newestByLang.get(p.lang) ?? '')) newestByLang.set(p.lang, lastmod)
  }

  const langs = [...newestByLang.keys()]
  for (const lang of langs) {
    byUrl.set(`${prefix}${lang}/`, {
      lastmod: newestByLang.get(lang),
      links: langs.map((l) => ({ lang: l, url: `${prefix}${l}/` })),
    })
  }

  return { root: prefix, byUrl }
}
