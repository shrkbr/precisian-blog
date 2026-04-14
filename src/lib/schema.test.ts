// precisian-blog/src/lib/schema.test.ts
import { describe, it, expect } from 'vitest'
import { buildBlogPostingJsonLd, buildOrganizationJsonLd } from './schema'

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
    expect(result['@type']).toBe('BlogPosting')
    expect(result.headline).toBe('Test Article')
    expect(result.datePublished).toBe('2026-04-13T10:00:00.000Z')
    expect(result.dateModified).toBe('2026-04-14T10:00:00.000Z')
    expect(result.inLanguage).toBe('pt-BR')
    expect(result.wordCount).toBe(1234)
    expect(result.keywords).toEqual(['ga4', 'attribution'])
    expect(result.author).toEqual({
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
