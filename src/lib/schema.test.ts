// precisian-blog/src/lib/schema.test.ts
import { describe, it, expect } from 'vitest'
import {
  buildBlogPostingJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildBreadcrumbListJsonLd,
} from './schema'

describe('buildBlogPostingJsonLd', () => {
  it('produces a valid BlogPosting object', () => {
    const result = buildBlogPostingJsonLd({
      title: 'Test Article',
      description: 'A test description',
      url: 'https://precisian.io/blog/pt-BR/posts/test',
      imageUrl: 'https://precisian.io/blog/og.png',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      updatedAt: new Date('2026-04-14T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 1234,
      tags: ['ga4', 'attribution'],
    })

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toEqual(['Article', 'BlogPosting'])
    expect(result.headline).toBe('Test Article')
    expect(result.datePublished).toBe('2026-04-13T10:00:00.000Z')
    expect(result.dateModified).toBe('2026-04-14T10:00:00.000Z')
    expect(result.inLanguage).toBe('pt-BR')
    expect(result.wordCount).toBe(1234)
    expect(result.keywords).toEqual(['ga4', 'attribution'])
    expect(result.author).toMatchObject({
      '@type': 'Organization',
      name: 'Precisian',
      url: 'https://precisian.io',
    })
  })

  it('omits dateModified when updatedAt is absent', () => {
    const result = buildBlogPostingJsonLd({
      title: 'Test',
      description: 'desc',
      url: 'https://precisian.io/blog/en/posts/test',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'en',
      wordCount: 500,
      tags: [],
    })
    expect(result.dateModified).toBeUndefined()
  })
})

describe('buildOrganizationJsonLd', () => {
  it('produces a valid Organization object', () => {
    const result = buildOrganizationJsonLd()
    expect(result['@type']).toBe('Organization')
    expect(result.name).toBe('Precisian')
    expect(result.url).toBe('https://precisian.io')
  })
})

describe('buildWebSiteJsonLd', () => {
  it('produces a WebSite schema with SearchAction', () => {
    const result = buildWebSiteJsonLd()
    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('WebSite')
    expect(result.name).toBe('Precisian Blog')
    expect(result.url).toBe('https://precisian.io/blog')
    expect(result.inLanguage).toEqual(['pt-BR', 'en'])
    expect(result.publisher['@type']).toBe('Organization')
    expect(result.publisher.name).toBe('Precisian')
    expect(result.potentialAction).toBeDefined()
    expect(result.potentialAction?.['@type']).toBe('SearchAction')
    const target = result.potentialAction?.target
    if (typeof target === 'string') {
      expect(target).toContain('{search_term_string}')
    } else {
      expect(target?.urlTemplate).toContain('{search_term_string}')
    }
  })
})

describe('buildBreadcrumbListJsonLd', () => {
  it('produces a BreadcrumbList with ordered items', () => {
    const result = buildBreadcrumbListJsonLd([
      { name: 'Home', url: 'https://precisian.io/blog/pt-BR/' },
      { name: 'Tags', url: 'https://precisian.io/blog/pt-BR/tags/' },
      { name: '#analytics', url: 'https://precisian.io/blog/pt-BR/tags/analytics' },
    ])
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result.itemListElement).toHaveLength(3)
    expect(result.itemListElement[0].position).toBe(1)
    expect(result.itemListElement[0].name).toBe('Home')
    expect(result.itemListElement[2].position).toBe(3)
    expect(result.itemListElement[2].item).toBe('https://precisian.io/blog/pt-BR/tags/analytics')
  })

  it('handles empty array without error', () => {
    const result = buildBreadcrumbListJsonLd([])
    expect(result.itemListElement).toEqual([])
  })
})

describe('buildOrganizationJsonLd (enhanced)', () => {
  it('includes sameAs array with known social profiles', () => {
    const result = buildOrganizationJsonLd()
    expect(result.sameAs).toBeDefined()
    expect(result.sameAs).toContain('https://linkedin.com/company/nacao-digital/')
    expect(result.sameAs).toContain('https://instagram.com/nacaodigital/')
    expect(result.description).toBeDefined()
    expect(typeof result.description).toBe('string')
  })
})

describe('buildBlogPostingJsonLd (enhanced)', () => {
  it('uses dual type Article + BlogPosting', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
    })
    expect(result['@type']).toEqual(['Article', 'BlogPosting'])
  })

  it('accepts authorSameAs override', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
      authorSameAs: ['https://linkedin.com/custom'],
    })
    const authorObj = result.author as { sameAs?: string[] }
    expect(authorObj.sameAs).toEqual(['https://linkedin.com/custom'])
  })

  it('defaults authorSameAs to known Precisian profiles when absent', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
    })
    const authorObj = result.author as { sameAs?: string[] }
    expect(authorObj.sameAs).toContain('https://linkedin.com/company/nacao-digital/')
  })

  it('includes mentions when provided', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
      mentions: ['https://ga.dev', 'https://www.google.com/analytics/'],
    })
    expect(result.mentions).toEqual([
      { '@type': 'Thing', url: 'https://ga.dev' },
      { '@type': 'Thing', url: 'https://www.google.com/analytics/' },
    ])
  })

  it('omits mentions when absent', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
    })
    expect(result.mentions).toBeUndefined()
  })

  it('includes about when provided', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
      about: ['https://en.wikipedia.org/wiki/Data_quality'],
    })
    expect(result.about).toEqual([
      { '@type': 'Thing', url: 'https://en.wikipedia.org/wiki/Data_quality' },
    ])
  })

  it('includes citations when provided', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
      citations: ['https://example.com/source1', 'https://example.com/source2'],
    })
    expect(result.citation).toHaveLength(2)
    expect(result.citation?.[0]).toMatchObject({ '@type': 'CreativeWork', url: 'https://example.com/source1' })
  })

  it('includes lastReviewed + reviewedBy when lastReviewed is provided', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
      lastReviewed: new Date('2026-04-14T10:00:00Z'),
    })
    expect(result.lastReviewed).toBe('2026-04-14T10:00:00.000Z')
    expect(result.reviewedBy).toBeDefined()
    expect((result.reviewedBy as { name: string })?.name).toBe('Precisian')
  })

  it('includes isPartOf pointing to the blog WebSite', () => {
    const result = buildBlogPostingJsonLd({
      title: 'T',
      description: 'D',
      url: 'https://precisian.io/blog/pt-BR/posts/t',
      publishedAt: new Date('2026-04-13T10:00:00Z'),
      author: 'Precisian',
      lang: 'pt-BR',
      wordCount: 100,
      tags: [],
    })
    expect(result.isPartOf).toBeDefined()
    const isPartOf = result.isPartOf as { '@type': string; url: string }
    expect(isPartOf['@type']).toBe('WebSite')
    expect(isPartOf.url).toBe('https://precisian.io/blog')
  })
})
