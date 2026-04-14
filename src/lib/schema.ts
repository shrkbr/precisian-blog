// precisian-blog/src/lib/schema.ts

const PRECISIAN_SAME_AS = [
  'https://precisian.io',
  'https://linkedin.com/company/nacao-digital/',
  'https://instagram.com/nacaodigital/',
] as const

const BLOG_URL = 'https://precisian.io/blog'
const ORG_NAME = 'Precisian'
const ORG_DESCRIPTION =
  'AI-powered GA4 data integrity platform by Nação Digital. Frameworks like DVQ (Data Value Quotient) and operating modules for attribution, MMM, and analytics engineering.'

// ──────────────────────────────────────────────────────────
// BlogPosting
// ──────────────────────────────────────────────────────────

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
  authorSameAs?: string[]
  mentions?: string[]
  about?: string[]
  citations?: string[]
  lastReviewed?: Date
}

export interface BlogPostingJsonLd {
  '@context': 'https://schema.org'
  '@type': ['Article', 'BlogPosting']
  headline: string
  description: string
  image?: string
  datePublished: string
  dateModified?: string
  author: {
    '@type': 'Organization'
    name: string
    url: string
    sameAs?: string[]
  }
  publisher: {
    '@type': 'Organization'
    name: string
    url: string
    logo: { '@type': 'ImageObject'; url: string }
    sameAs?: string[]
  }
  mainEntityOfPage: string
  inLanguage: 'pt-BR' | 'en'
  wordCount: number
  keywords: string[]
  isPartOf: {
    '@type': 'WebSite'
    name: string
    url: string
  }
  mentions?: { '@type': 'Thing'; url: string }[]
  about?: { '@type': 'Thing'; url: string }[]
  citation?: { '@type': 'CreativeWork'; url: string }[]
  lastReviewed?: string
  reviewedBy?: {
    '@type': 'Organization'
    name: string
  }
}

export function buildBlogPostingJsonLd(input: BlogPostingInput): BlogPostingJsonLd {
  const authorSameAs = input.authorSameAs ?? [...PRECISIAN_SAME_AS]

  const base: BlogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Article', 'BlogPosting'],
    headline: input.title,
    description: input.description,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    datePublished: input.publishedAt.toISOString(),
    ...(input.updatedAt ? { dateModified: input.updatedAt.toISOString() } : {}),
    author: {
      '@type': 'Organization',
      name: input.author,
      url: 'https://precisian.io',
      sameAs: authorSameAs,
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: 'https://precisian.io',
      logo: {
        '@type': 'ImageObject',
        url: 'https://precisian.io/blog/precisian-logo.png',
      },
      sameAs: [...PRECISIAN_SAME_AS],
    },
    mainEntityOfPage: input.url,
    inLanguage: input.lang,
    wordCount: input.wordCount,
    keywords: input.tags,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Precisian Blog',
      url: BLOG_URL,
    },
  }

  if (input.mentions && input.mentions.length > 0) {
    base.mentions = input.mentions.map((url) => ({ '@type': 'Thing' as const, url }))
  }
  if (input.about && input.about.length > 0) {
    base.about = input.about.map((url) => ({ '@type': 'Thing' as const, url }))
  }
  if (input.citations && input.citations.length > 0) {
    base.citation = input.citations.map((url) => ({ '@type': 'CreativeWork' as const, url }))
  }
  if (input.lastReviewed) {
    base.lastReviewed = input.lastReviewed.toISOString()
    base.reviewedBy = {
      '@type': 'Organization',
      name: ORG_NAME,
    }
  }

  return base
}

// ──────────────────────────────────────────────────────────
// Organization (site-wide)
// ──────────────────────────────────────────────────────────

export interface OrganizationJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  description: string
  sameAs: string[]
}

export function buildOrganizationJsonLd(): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: 'https://precisian.io',
    logo: 'https://precisian.io/blog/precisian-logo.png',
    description: ORG_DESCRIPTION,
    sameAs: [...PRECISIAN_SAME_AS],
  }
}

// ──────────────────────────────────────────────────────────
// WebSite (site-wide with SearchAction)
// ──────────────────────────────────────────────────────────

export interface WebSiteJsonLd {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  description: string
  inLanguage: ('pt-BR' | 'en')[]
  publisher: {
    '@type': 'Organization'
    name: string
    url: string
  }
  potentialAction?: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

export function buildWebSiteJsonLd(): WebSiteJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Precisian Blog',
    url: BLOG_URL,
    description: ORG_DESCRIPTION,
    inLanguage: ['pt-BR', 'en'],
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: 'https://precisian.io',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://precisian.io/blog/pt-BR/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ──────────────────────────────────────────────────────────
// BreadcrumbList
// ──────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbListJsonLd {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: {
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }[]
}

export function buildBreadcrumbListJsonLd(items: BreadcrumbItem[]): BreadcrumbListJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// ──────────────────────────────────────────────────────────
// Utility
// ──────────────────────────────────────────────────────────

export function countWords(markdown: string): number {
  return markdown.trim().split(/\s+/).filter(Boolean).length
}
