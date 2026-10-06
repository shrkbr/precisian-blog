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
      // Ficam fora: /blog/ (so um redirect para /blog/pt-BR/, a canonical
      // aponta pra la) e pagina de tag rasa, que sai com noindex.
      filter: (page) =>
        page !== sitemapMeta.root && sitemapMeta.tagPage(page)?.indexable !== false,
      // lastmod e hreflang vem do conteudo (src/lib/sitemap-meta.mjs), nao do
      // casamento por caminho da integracao: post e tag mudam de nome entre
      // idiomas, entao pelo caminho os pares nunca se encontram.
      serialize(item) {
        const meta = sitemapMeta.byUrl.get(item.url) ?? sitemapMeta.tagPage(item.url)
        return meta ? { ...item, lastmod: meta.lastmod, links: meta.links } : item
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
