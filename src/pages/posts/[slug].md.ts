// precisian-blog/src/pages/posts/[slug].md.ts
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft)
  return posts.map((post) => ({
    params: { slug: post.data.slug },
    props: { post },
  }))
}

export const GET: APIRoute = ({ props }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { post } = props as any

  const frontmatterLines: string[] = [
    '---',
    `title: ${JSON.stringify(post.data.title)}`,
    `description: ${JSON.stringify(post.data.description)}`,
    `slug: ${post.data.slug}`,
    `lang: ${post.data.lang}`,
    `translationKey: ${post.data.translationKey}`,
    `author: ${post.data.author}`,
    `publishedAt: ${post.data.publishedAt.toISOString()}`,
    `tags: [${post.data.tags.map((t: string) => JSON.stringify(t)).join(', ')}]`,
    '---',
    '',
  ]

  const body = frontmatterLines.join('\n') + (post.body ?? '')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
