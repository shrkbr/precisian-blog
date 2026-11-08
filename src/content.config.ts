// precisian-blog/src/content.config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(10).max(100),
    description: z.string().min(50).max(160),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'slug must be kebab-case'),
    lang: z.enum(['pt-BR', 'en']),
    translationKey: z.string(),
    author: z.string().default('Precisian'),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).min(1).max(8),
    coverImage: z.string().optional(),
    readingTimeMinutes: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
    llmSummary: z.string().max(300).optional(),
    mentions: z.array(z.string().url()).optional(),
    about: z.array(z.string().url()).optional(),
    citations: z.array(z.string().url()).optional(),
    lastReviewed: z.coerce.date().optional(),
    // Escada de CTA (src/lib/cta.ts). Sem `cta`, vale o padrão por tag/slug.
    cta: z.enum(['regua', 'ficha', 'demo', 'newsletter', 'conversa']).optional(),
    ctaHook: z.string().max(160).optional(),
  }),
})

export const collections = { posts }
