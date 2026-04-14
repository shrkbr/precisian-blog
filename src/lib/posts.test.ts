// precisian-blog/src/lib/posts.test.ts
import { describe, it, expect } from 'vitest'
import { filterPublishedByLang, findTranslation, sortByDateDesc, collectTags } from './posts'

type TestPost = {
  data: {
    lang: 'pt-BR' | 'en'
    translationKey: string
    publishedAt: Date
    tags: string[]
    draft: boolean
  }
}

const makePost = (overrides: Partial<TestPost['data']>): TestPost => ({
  data: {
    lang: 'pt-BR',
    translationKey: 'key',
    publishedAt: new Date('2026-01-01'),
    tags: [],
    draft: false,
    ...overrides,
  },
})

describe('filterPublishedByLang', () => {
  it('returns only posts matching lang and not draft', () => {
    const posts = [
      makePost({ lang: 'pt-BR' }),
      makePost({ lang: 'en' }),
      makePost({ lang: 'pt-BR', draft: true }),
    ]
    const result = filterPublishedByLang(posts as any, 'pt-BR')
    expect(result).toHaveLength(1)
  })
})

describe('findTranslation', () => {
  it('finds counterpart by translationKey and different lang', () => {
    const current = makePost({ lang: 'pt-BR', translationKey: 'abc' })
    const other = makePost({ lang: 'en', translationKey: 'abc' })
    const unrelated = makePost({ lang: 'en', translationKey: 'xyz' })
    const result = findTranslation([current, other, unrelated] as any, current as any, 'en')
    expect(result).toBe(other)
  })

  it('returns undefined when no translation exists', () => {
    const current = makePost({ lang: 'pt-BR', translationKey: 'abc' })
    const result = findTranslation([current] as any, current as any, 'en')
    expect(result).toBeUndefined()
  })
})

describe('sortByDateDesc', () => {
  it('sorts posts with newest first', () => {
    const old = makePost({ publishedAt: new Date('2026-01-01') })
    const mid = makePost({ publishedAt: new Date('2026-02-01') })
    const newer = makePost({ publishedAt: new Date('2026-03-01') })
    const result = sortByDateDesc([old, newer, mid] as any)
    expect(result[0]).toBe(newer)
    expect(result[2]).toBe(old)
  })
})

describe('collectTags', () => {
  it('collects unique tags across posts', () => {
    const posts = [
      makePost({ tags: ['a', 'b'] }),
      makePost({ tags: ['b', 'c'] }),
    ]
    const result = collectTags(posts as any)
    expect(result.sort()).toEqual(['a', 'b', 'c'])
  })
})
