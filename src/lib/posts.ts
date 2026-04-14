// precisian-blog/src/lib/posts.ts
import type { CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'posts'>

export function filterPublishedByLang(posts: Post[], lang: Post['data']['lang']): Post[] {
  return posts.filter((p) => p.data.lang === lang && !p.data.draft)
}

export function findTranslation(
  allPosts: Post[],
  current: Post,
  targetLang: Post['data']['lang'],
): Post | undefined {
  return allPosts.find(
    (p) =>
      p.data.translationKey === current.data.translationKey &&
      p.data.lang === targetLang &&
      p !== current,
  )
}

export function sortByDateDesc(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  )
}

export function collectTags(posts: Post[]): string[] {
  const tagSet = new Set<string>()
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet)
}

export function filterByTag(posts: Post[], tag: string): Post[] {
  return posts.filter((p) => p.data.tags.includes(tag))
}
