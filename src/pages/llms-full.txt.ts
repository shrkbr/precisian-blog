// precisian-blog/src/pages/llms-full.txt.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { filterPublishedByLang, sortByDateDesc } from '../lib/posts'

export const GET: APIRoute = async ({ site }) => {
  const all = await getCollection('posts')
  const sections: string[] = []
  const baseUrl = site ? new URL('/blog', site).toString() : 'https://precisian.io/blog'

  sections.push('# Precisian Blog — Full Content')
  sections.push('')
  sections.push('> Complete dump of all published articles across languages. For LLM ingestion.')
  sections.push('')

  for (const lang of ['pt-BR', 'en'] as const) {
    const posts = sortByDateDesc(filterPublishedByLang(all, lang))
    for (const post of posts) {
      sections.push(`---`)
      sections.push(``)
      sections.push(`## ${post.data.title}`)
      sections.push(``)
      sections.push(`**Language:** ${lang}`)
      sections.push(`**URL:** ${baseUrl}/${lang}/posts/${post.data.slug}`)
      sections.push(`**Published:** ${post.data.publishedAt.toISOString()}`)
      sections.push(`**Tags:** ${post.data.tags.join(', ')}`)
      if (post.data.llmSummary) {
        sections.push(`**Summary:** ${post.data.llmSummary}`)
      }
      sections.push(``)
      sections.push(post.body ?? '')
      sections.push(``)
    }
  }

  return new Response(sections.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
