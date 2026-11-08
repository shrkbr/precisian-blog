// precisian-blog/src/lib/cta.test.ts
import { describe, it, expect } from 'vitest'
import { defaultCta, withUtm, resolveCta, REGUA_LIVE } from './cta'

describe('defaultCta', () => {
  it('comparativo pelo slug vira ficha', () => {
    expect(defaultCta('precisian-ou-windsor-ai', ['comparativo'])).toBe('ficha')
    expect(defaultCta('best-etl-tools-for-marketing-data', ['etl'])).toBe('ficha')
    expect(defaultCta('construir-ou-contratar-data-lake', [])).toBe('ficha')
  })
  it('divergência de dado vira regua', () => {
    expect(defaultCta('vtex-ga4-nao-batem', ['vtex', 'ga4'])).toBe('regua')
    expect(defaultCta('shopify-ga4-revenue-mismatch', ['data-discrepancy'])).toBe('regua')
  })
  it('agente / MCP / governança vira demo', () => {
    expect(defaultCta('isolamento-por-cliente-mcp', ['mcp'])).toBe('demo')
    expect(defaultCta('ai-data-governance', ['governance'])).toBe('demo')
  })
  it('âncora sem tag especial vira newsletter', () => {
    expect(defaultCta('camada-semantica', ['camada-semantica'])).toBe('newsletter')
  })
  it('front-matter explícito vence a heurística', () => {
    const r = resolveCta({ slug: 'camada-semantica', tags: [], cta: 'demo' }, 'pt-BR', 'fim')
    expect(r.name).toBe('demo')
  })
})

describe('withUtm', () => {
  it('marca post e posição', () => {
    const u = new URL(withUtm('https://precisian.io/precos', 'precisian-ou-nekt', 'lateral'))
    expect(u.searchParams.get('utm_source')).toBe('blog')
    expect(u.searchParams.get('utm_medium')).toBe('cta')
    expect(u.searchParams.get('utm_campaign')).toBe('precisian-ou-nekt')
    expect(u.searchParams.get('utm_content')).toBe('lateral')
  })
  it('preserva o fragmento #diagnostico', () => {
    const href = withUtm('https://precisian.io/#diagnostico', 'x', 'fim')
    expect(href.endsWith('#diagnostico')).toBe(true)
    expect(href).toContain('utm_campaign=x')
  })
  it('não toca a agenda do Notion', () => {
    const agenda = 'https://calendar.notion.so/meet/rodrigomartucci/precisian-io'
    expect(withUtm(agenda, 'x', 'fim')).toBe(agenda)
  })
})

describe('resolveCta', () => {
  it('post en nunca aponta para a agenda do Rodrigo', () => {
    for (const cta of ['regua', 'ficha', 'demo', 'newsletter'] as const) {
      const r = resolveCta({ slug: 's', tags: [], cta }, 'en', 'fim')
      expect(r.secondary).toBeUndefined()
      for (const b of r.buttons) expect(b.href).not.toContain('calendar.notion.so')
    }
  })
  it('segundo link (agenda) só em pt-BR, só regua/ficha, só no fim', () => {
    expect(resolveCta({ slug: 's', tags: [], cta: 'regua' }, 'pt-BR', 'fim').secondary).toContain('calendar.notion.so')
    expect(resolveCta({ slug: 's', tags: [], cta: 'ficha' }, 'pt-BR', 'fim').secondary).toContain('calendar.notion.so')
    expect(resolveCta({ slug: 's', tags: [], cta: 'demo' }, 'pt-BR', 'fim').secondary).toBeUndefined()
    expect(resolveCta({ slug: 's', tags: [], cta: 'regua' }, 'pt-BR', 'lateral').secondary).toBeUndefined()
  })
  it('regua usa o interino (demo) enquanto a Régua não existe', () => {
    const r = resolveCta({ slug: 's', tags: [], cta: 'regua' }, 'pt-BR', 'fim')
    const esperado = REGUA_LIVE ? 'precisian.io/regua' : 'precisian.io/demonstracao'
    expect(r.buttons[0].href).toContain(esperado)
  })
  it('ctaHook substitui a linha padrão', () => {
    const r = resolveCta({ slug: 's', tags: [], cta: 'demo', ctaHook: 'Linha do post.' }, 'en', 'fim')
    expect(r.line).toBe('Linha do post.')
  })
  it('nunca usa as palavras proibidas', () => {
    for (const lang of ['pt-BR', 'en'] as const)
      for (const cta of ['regua', 'ficha', 'demo', 'newsletter', 'conversa'] as const) {
        const r = resolveCta({ slug: 's', tags: [], cta }, lang, 'fim')
        const texto = `${r.title} ${r.line} ${r.buttons.map((b) => b.label).join(' ')}`.toLowerCase()
        expect(texto).not.toMatch(/gratuito|grátis|\bfree\b|dashboard|especialista/)
      }
  })
})
