// precisian-blog/src/pages/[lang]/rss.xml.ts
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIRoute } from 'astro'
import { filterPublishedByLang, sortByDateDesc } from '../../lib/posts'

export async function getStaticPaths() {
  return [
    { params: { lang: 'pt-BR' } },
    { params: { lang: 'en' } },
  ]
}

export const GET: APIRoute = async ({ params, site }) => {
  const lang = params.lang as 'pt-BR' | 'en'
  const all = await getCollection('posts')
  const posts = sortByDateDesc(filterPublishedByLang(all, lang))

  return rss({
    title: lang === 'pt-BR' ? 'Precisian Blog' : 'Precisian Blog (EN)',
    description:
      lang === 'pt-BR'
        ? 'Blog técnico da Precisian — GA4, data quality, attribution, analytics engineering.'
        : 'Precisian technical blog — GA4, data quality, attribution, analytics engineering.',
    site: site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedAt,
      description: post.data.description,
      link: `/blog/${lang}/posts/${post.data.slug}`,
      categories: post.data.tags,
    })),
    customData: `<language>${lang}</language>`,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
  })
}
