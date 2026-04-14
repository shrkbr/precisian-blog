// precisian-blog/astro.config.mjs
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'

export default defineConfig({
  site: 'https://precisian.io',
  base: '/blog',
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
