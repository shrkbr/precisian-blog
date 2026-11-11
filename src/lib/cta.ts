// precisian-blog/src/lib/cta.ts
// Escada de CTA por intenção do post. Fonte da copy e das regras:
// marketing-os/companies/precisian/Blog/cta/CTA-SYSTEM.md. Mudou lá, muda aqui.
//
// Cada post declara `cta` no front-matter (regua | ficha | demo | newsletter |
// conversa). Sem a chave, vale o padrão por tag/slug de `defaultCta`.

export type CtaName = 'regua' | 'ficha' | 'demo' | 'newsletter' | 'conversa'
export type CtaPosition = 'fim' | 'lateral' | 'topo' | 'meio'
export type CtaLang = 'pt-BR' | 'en'

export const CTA_NAMES: readonly CtaName[] = ['regua', 'ficha', 'demo', 'newsletter', 'conversa']

// 🔴 A Régua de Divergência ainda não existe no site (precisian.io/regua = 404).
// Enquanto REGUA_LIVE for false, `regua` renderiza o interino: a demo ao vivo
// com a pergunta do post. Virar para true quando a rota subir.
export const REGUA_LIVE = false

const AGENDA = 'https://calendar.notion.so/meet/rodrigomartucci/precisian-io'

export interface CtaButton {
  key: string
  label: string
  href: string
  external?: boolean
}

export interface ResolvedCta {
  name: CtaName
  title: string
  line: string
  buttons: CtaButton[]
  // Frase com o segundo link (agenda do Rodrigo), só pt-BR, só regua/ficha, só no fim.
  secondary?: string
}

const DEST: Record<CtaLang, Record<CtaName, CtaButton[]>> = {
  'pt-BR': {
    regua: REGUA_LIVE
      ? [{ key: 'regua', label: 'Medir a divergência', href: 'https://precisian.io/regua' }]
      : [{ key: 'demo', label: 'Abrir a demo ao vivo', href: 'https://precisian.io/demonstracao' }],
    ficha: [
      { key: 'precos', label: 'Ver preços', href: 'https://precisian.io/precos' },
      { key: 'ficha', label: 'Pedir a ficha técnica', href: 'https://precisian.io/#diagnostico' },
    ],
    demo: [{ key: 'demo', label: 'Abrir a demo ao vivo', href: 'https://precisian.io/demonstracao' }],
    newsletter: [{ key: 'newsletter', label: 'Receber a newsletter', href: 'https://precisian.io/newsletter' }],
    conversa: [{ key: 'agenda', label: 'Abrir a agenda', href: AGENDA, external: true }],
  },
  en: {
    regua: REGUA_LIVE
      ? [{ key: 'regua', label: 'Measure the gap', href: 'https://precisian.io/en/divergence-check' }]
      : [{ key: 'demo', label: 'Open the live demo', href: 'https://precisian.io/en/demo' }],
    ficha: [
      { key: 'pricing', label: 'See pricing', href: 'https://precisian.io/en/pricing' },
      { key: 'ficha', label: 'Request the spec sheet', href: 'https://precisian.io/en#diagnostico' },
    ],
    demo: [{ key: 'demo', label: 'Open the live demo', href: 'https://precisian.io/en/demo' }],
    newsletter: [{ key: 'newsletter', label: 'Get the newsletter', href: 'https://precisian.io/en/newsletter' }],
    conversa: [{ key: 'agenda', label: 'Open the calendar', href: AGENDA, external: true }],
  },
}

const COPY: Record<CtaLang, Record<CtaName, { title: string; line: string }>> = {
  'pt-BR': {
    regua: REGUA_LIVE
      ? {
          title: 'Quanto o seu número não bate?',
          line: 'Faturamento do ERP num lado, receita que Meta, Google e TikTok declaram no outro. A Régua devolve a diferença em reais e em vezes.',
        }
      : {
          title: 'Veja a pergunta respondida sobre um lake de verdade',
          line: 'A demo ao vivo roda sobre uma operação-modelo de varejo. Faça a pergunta deste post para ela.',
        },
    ficha: {
      title: 'O que a Precisian inclui, e quanto custa',
      line: 'Preço publicado, sem setup e sem cobrança por assento. A ficha técnica detalha conectores, camada semântica, MCP, API e isolamento por cliente.',
    },
    demo: {
      title: 'Veja um MCP governado respondendo',
      line: 'Claude ligado a um lake isolado, sobre uma operação-modelo de varejo. Pergunte o que este post discute e veja o que o agente consegue, e não consegue, ler.',
    },
    newsletter: {
      title: 'Uma edição a cada quinze dias',
      line: 'Dado e IA para quem decide com número: o que mudou, o que quebrou e o que a pesquisa da Precisian mediu. Às quintas.',
    },
    conversa: {
      title: 'Falar direto sobre o seu caso',
      line: 'Sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.',
    },
  },
  en: {
    regua: REGUA_LIVE
      ? {
          title: 'How far off is your number?',
          line: 'ERP revenue on one side, what Meta, Google and TikTok claim on the other. The check returns the gap in dollars and in multiples.',
        }
      : {
          title: 'See this question answered on a real lake',
          line: 'The live demo runs on a model retail operation. Ask it this article’s question.',
        },
    ficha: {
      title: 'What Precisian includes, and what it costs',
      line: 'Published pricing, no setup fee, no per-seat charge. The spec sheet covers connectors, semantic layer, MCP, API and per-client isolation.',
    },
    demo: {
      title: 'Watch a governed MCP answer',
      line: 'Claude wired to an isolated lake over a model retail operation. Ask what this article discusses and see what the agent can, and cannot, read.',
    },
    newsletter: {
      title: 'One issue every two weeks',
      line: 'Data and AI for people who decide with numbers: what changed, what broke and what Precisian’s research measured. Thursdays.',
    },
    conversa: {
      title: 'Talk about your case',
      line: 'No contract commitment, and no promise of an answer in 30 minutes either.',
    },
  },
}

const SECONDARY: Record<CtaLang, string> = {
  'pt-BR': `Se preferir falar direto sobre o seu caso, <a href="${AGENDA}" rel="noopener" target="_blank" data-cta-button="agenda">a agenda está aberta</a>, sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.`,
  en: '',
}

const FICHA_SLUG = /-ou-|-vs-|alternativ|melhores|^best-|build-vs|construir-ou|pricing|cdp-para|cdp-ou|plataformas-de|ferramentas-de|consultorias/
const REGUA_TAGS = ['divergencia-de-dados', 'ga4', 'pix', 'vtex', 'marketplace', 'tracking', 'atribuicao', 'data-discrepancy', 'attribution']
const DEMO_TAGS = ['mcp', 'dados-para-ia', 'seguranca', 'seguranca-de-dados', 'governanca', 'auditoria', 'lgpd', 'ai-data-access', 'governance', 'security']

/** Padrão por slug/tag quando o post não declara `cta` (CTA-SYSTEM.md §1). */
export function defaultCta(slug: string, tags: readonly string[]): CtaName {
  const t = new Set(tags)
  if (FICHA_SLUG.test(slug) || t.has('build-vs-buy')) return 'ficha'
  if (REGUA_TAGS.some((x) => t.has(x))) return 'regua'
  if (DEMO_TAGS.some((x) => t.has(x))) return 'demo'
  return 'newsletter'
}

/** UTM por post e posição. A agenda do Notion não lê UTM, então fica limpa. */
export function withUtm(href: string, slug: string, position: CtaPosition): string {
  if (href.startsWith('https://calendar.notion.so')) return href
  const u = new URL(href)
  u.searchParams.set('utm_source', 'blog')
  u.searchParams.set('utm_medium', 'cta')
  u.searchParams.set('utm_campaign', slug)
  u.searchParams.set('utm_content', position)
  return u.toString()
}

export interface CtaPostData {
  slug: string
  tags: readonly string[]
  cta?: CtaName
  ctaHook?: string
}

export function resolveCta(data: CtaPostData, lang: CtaLang, position: CtaPosition): ResolvedCta {
  const name: CtaName = data.cta ?? defaultCta(data.slug, data.tags)
  const copy = COPY[lang][name]
  const buttons = DEST[lang][name].map((b) => ({ ...b, href: withUtm(b.href, data.slug, position) }))
  const secondary =
    lang === 'pt-BR' && position === 'fim' && (name === 'regua' || name === 'ficha') && SECONDARY[lang]
      ? SECONDARY[lang]
      : undefined
  return { name, title: copy.title, line: data.ctaHook ?? copy.line, buttons, secondary }
}
