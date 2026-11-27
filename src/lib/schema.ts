// precisian-blog/src/lib/schema.ts

const PRECISIAN_SAME_AS = [
  'https://precisian.io',
  'https://www.linkedin.com/company/precisiananalytics/',
  'https://www.instagram.com/precisian.io/',
] as const

const BLOG_URL = 'https://precisian.io/blog'
const ORG_NAME = 'Precisian'
// Posicionamento de 09/09/2026: a entrega termina na camada semântica e quem
// consome é a IA, o BI ou a automação do próprio cliente. Nada de MMM, DVQ,
// atribuição como módulo ou dashboard (produtos extintos).
const ORG_DESCRIPTION =
  "Managed data platform for ecommerce and retail. Precisian Lake keeps each client's marketing and sales data in an isolated data lake with full history, and a semantic layer with versioned metric definitions delivers it to the client's own AI, BI or automation through MCP, API or a direct BI connection. Precisian does not run media."

// Logo oficial achatado sobre #030303 (o arquivo do site é branco sobre
// transparente e some em fundo claro). Servido de public/precisian-logo.png.
const ORG_LOGO = 'https://precisian.io/blog/precisian-logo.png'

// Autores humanos conhecidos. Sem cadastro aqui, o autor cai em Organization.
// Fonte do perfil: decisão de 13/07/2026 (Gabriel Sorato é a cara da Precisian).
const AUTHORS: Record<string, { jobTitle: Record<'pt-BR' | 'en', string>; sameAs: string[] }> = {
  'Gabriel Sorato': {
    jobTitle: { 'pt-BR': 'Head de Dados da Precisian', en: 'Head of Data at Precisian' },
    sameAs: ['https://www.linkedin.com/in/gabrielsorato/'],
  },
}

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
  author:
    | {
        '@type': 'Organization'
        name: string
        url: string
        sameAs?: string[]
      }
    | {
        '@type': 'Person'
        name: string
        jobTitle: string
        sameAs: string[]
        worksFor: { '@type': 'Organization'; name: string; url: string }
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
  const person = AUTHORS[input.author]
  const author: BlogPostingJsonLd['author'] = person
    ? {
        '@type': 'Person',
        name: input.author,
        jobTitle: person.jobTitle[input.lang],
        sameAs: input.authorSameAs ?? person.sameAs,
        worksFor: { '@type': 'Organization', name: ORG_NAME, url: 'https://precisian.io' },
      }
    : {
        '@type': 'Organization',
        name: input.author,
        url: 'https://precisian.io',
        sameAs: authorSameAs,
      }

  const base: BlogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Article', 'BlogPosting'],
    headline: input.title,
    description: input.description,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    datePublished: input.publishedAt.toISOString(),
    ...(input.updatedAt ? { dateModified: input.updatedAt.toISOString() } : {}),
    author,
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: 'https://precisian.io',
      logo: {
        '@type': 'ImageObject',
        url: ORG_LOGO,
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
    logo: ORG_LOGO,
    description: ORG_DESCRIPTION,
    sameAs: [...PRECISIAN_SAME_AS],
  }
}

// ──────────────────────────────────────────────────────────
// WebSite (site-wide). Sem SearchAction: o blog não tem busca, e `?q=` só
// devolvia a home (declaração falsa para o Google).
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
