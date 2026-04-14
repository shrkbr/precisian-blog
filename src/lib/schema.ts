// precisian-blog/src/lib/schema.ts
export interface BlogPostingInput {
  title: string
  description: string
  url: string
  imageUrl?: string
  publishedAt: Date
  updatedAt?: Date
  author: string
  lang: 'pt-BR' | 'en'
  wordCount: number
  tags: string[]
}

export interface BlogPostingJsonLd {
  '@context': 'https://schema.org'
  '@type': 'BlogPosting'
  headline: string
  description: string
  image?: string
  datePublished: string
  dateModified?: string
  author: { '@type': 'Organization'; name: string; url: string }
  publisher: {
    '@type': 'Organization'
    name: string
    url: string
    logo: { '@type': 'ImageObject'; url: string }
  }
  mainEntityOfPage: string
  inLanguage: 'pt-BR' | 'en'
  wordCount: number
  keywords: string[]
}

export function buildBlogPostingJsonLd(input: BlogPostingInput): BlogPostingJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    datePublished: input.publishedAt.toISOString(),
    ...(input.updatedAt ? { dateModified: input.updatedAt.toISOString() } : {}),
    author: {
      '@type': 'Organization',
      name: input.author,
      url: 'https://precisian.io',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Precisian',
      url: 'https://precisian.io',
      logo: {
        '@type': 'ImageObject',
        url: 'https://precisian.io/blog/precisian-logo.png',
      },
    },
    mainEntityOfPage: input.url,
    inLanguage: input.lang,
    wordCount: input.wordCount,
    keywords: input.tags,
  }
}

export interface OrganizationJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
}

export function buildOrganizationJsonLd(): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Precisian',
    url: 'https://precisian.io',
    logo: 'https://precisian.io/blog/precisian-logo.png',
  }
}

export function countWords(markdown: string): number {
  return markdown.trim().split(/\s+/).filter(Boolean).length
}
