// precisian-blog/astro.config.mjs
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'
import { buildSitemapMeta } from './src/lib/sitemap-meta.mjs'

const SITE = 'https://precisian.io'
const BASE = '/blog'
const sitemapMeta = buildSitemapMeta(SITE, BASE)

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  output: 'static',
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
    fallback: {
      en: 'pt-BR',
    },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'pt-BR',
        locales: {
          'pt-BR': 'pt-BR',
          en: 'en',
        },
      },
      // /blog/ e so um redirect para /blog/pt-BR/ (canonical aponta pra la).
      filter: (page) => page !== sitemapMeta.root,
      serialize(item) {
        const meta = sitemapMeta.byUrl.get(item.url)
        if (meta) {
          // Post e indice de idioma: lastmod e hreflang vem do conteudo
          // (ver src/lib/sitemap-meta.mjs), nao do casamento por caminho.
          return { ...item, lastmod: meta.lastmod, links: meta.links }
        }
        // Demais paginas (tags): a integracao lista /blog/ como um segundo
        // "pt-BR". Tira o redirect e fica so o par real.
        if (item.links) {
          item.links = item.links.filter((l) => l.url !== sitemapMeta.root)
        }
        const tagLastmod = sitemapMeta.tagLastmod(item.url)
        if (tagLastmod) item.lastmod = tagLastmod
        return item
      },
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'tokyo-night',
      wrap: true,
    },
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})
