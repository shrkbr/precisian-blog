// precisian-blog/src/pages/llms.txt.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { filterPublishedByLang, sortByDateDesc } from '../lib/posts'

export const GET: APIRoute = async ({ site }) => {
  const all = await getCollection('posts')
  const ptPosts = sortByDateDesc(filterPublishedByLang(all, 'pt-BR'))
  const enPosts = sortByDateDesc(filterPublishedByLang(all, 'en'))

  const baseUrl = site ? new URL('/blog', site).toString() : 'https://precisian.io/blog'

  const lines: string[] = [
    '# Precisian Blog',
    '',
    '> Technical blog from Precisian — AI-powered GA4 data integrity platform by Nação Digital. Articles on data quality, MMM, attribution, GTM, and analytics engineering. Content is bilingual (pt-BR + en).',
    '',
    '## Artigos em Português',
    '',
  ]

  for (const post of ptPosts) {
    const url = `${baseUrl}/pt-BR/posts/${post.data.slug}`
    const summary = post.data.llmSummary ?? post.data.description
    lines.push(`- [${post.data.title}](${url}): ${summary}`)
  }

  lines.push('', '## Articles in English', '')
  for (const post of enPosts) {
    const url = `${baseUrl}/en/posts/${post.data.slug}`
    const summary = post.data.llmSummary ?? post.data.description
    lines.push(`- [${post.data.title}](${url}): ${summary}`)
  }

  lines.push(
    '',
    '## Optional',
    '',
    `- [RSS Feed PT](${baseUrl}/pt-BR/rss.xml)`,
    `- [RSS Feed EN](${baseUrl}/en/rss.xml)`,
    `- [Full content dump](${baseUrl}/llms-full.txt)`,
    '',
  )

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
