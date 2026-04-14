// precisian-blog/src/i18n/utils.test.ts
import { describe, it, expect } from 'vitest'
import { getLangFromUrl, useTranslations, getLocalizedPath } from './utils'

describe('getLangFromUrl', () => {
  it('returns pt-BR for /blog/pt-BR/ paths', () => {
    expect(getLangFromUrl(new URL('https://precisian.io/blog/pt-BR/'))).toBe('pt-BR')
  })

  it('returns en for /blog/en/ paths', () => {
    expect(getLangFromUrl(new URL('https://precisian.io/blog/en/posts/welcome'))).toBe('en')
  })

  it('defaults to pt-BR for unknown lang', () => {
    expect(getLangFromUrl(new URL('https://precisian.io/blog/'))).toBe('pt-BR')
  })
})

describe('useTranslations', () => {
  it('returns translated string for valid key', () => {
    const t = useTranslations('pt-BR')
    expect(t('nav.home')).toBe('Início')
  })

  it('returns en translation for en locale', () => {
    const t = useTranslations('en')
    expect(t('nav.home')).toBe('Home')
  })

  it('falls back to default lang for missing lang', () => {
    // @ts-expect-error testing invalid lang at runtime
    const t = useTranslations('es')
    expect(t('nav.home')).toBe('Início')
  })
})

describe('getLocalizedPath', () => {
  it('prepends lang prefix to path', () => {
    expect(getLocalizedPath('en', 'posts/welcome')).toBe('/en/posts/welcome')
  })

  it('handles leading slash in path', () => {
    expect(getLocalizedPath('pt-BR', '/posts/bem-vindo')).toBe('/pt-BR/posts/bem-vindo')
  })
})
