// precisian-blog/src/lib/tags.mjs
//
// Regras de tag que valem tanto para as paginas quanto para o sitemap. E .mjs
// puro porque o astro.config.mjs (via sitemap-meta.mjs) tambem importa daqui,
// e ele roda antes do Astro existir.

/**
 * Pagina de tag com menos posts que isto sai com `noindex, follow` e fica fora
 * do sitemap: uma lista de um post so e conteudo raso, duplicata do proprio post.
 */
export const MIN_POSTS_FOR_INDEXED_TAG = 2

/**
 * Tag pt-BR -> tag en, so para as que MUDAM entre idiomas. Tag que e igual nos
 * dois (mcp, ga4, roas...) nao entra: o par e ela mesma.
 *
 * Post em ingles usa tag em ingles. Ao criar uma tag nova em portugues que
 * tenha traducao, registre aqui, senao a pagina da tag fica sem hreflang e o
 * seletor de idioma dela leva pra home do blog.
 * @type {Record<string, string>}
 */
export const TAG_PT_TO_EN = {
  agencia: 'agency',
  'alucinacao-de-metrica': 'metric-hallucination',
  'arquitetura-de-dados': 'data-architecture',
  atribuicao: 'attribution',
  auditoria: 'audit',
  'calculadora-roi': 'roi-calculator',
  'camada-semantica': 'semantic-layer',
  confiabilidade: 'reliability',
  consentimento: 'consent',
  'contrato-de-dados': 'data-contract',
  'contrato-de-metrica': 'metric-contract',
  custo: 'cost',
  'dados-para-ia': 'ai-data-access',
  'divergencia-de-dados': 'data-discrepancy',
  'feed-de-produto': 'product-feed',
  governanca: 'governance',
  incrementalidade: 'incrementality',
  integracao: 'integration',
  observabilidade: 'observability',
  pagamento: 'payments',
  privacidade: 'privacy',
  seguranca: 'security',
  'seguranca-de-dados': 'data-security',
  'validacao-modelo': 'model-validation',
}

const TAG_EN_TO_PT = Object.fromEntries(Object.entries(TAG_PT_TO_EN).map(([pt, en]) => [en, pt]))

/**
 * Nome que a mesma tag tem no outro idioma. Nao garante que exista post com
 * ela la: quem chama confere.
 * @param {string} tag
 * @param {'pt-BR' | 'en'} fromLang
 * @returns {string}
 */
export function counterpartTag(tag, fromLang) {
  const table = fromLang === 'pt-BR' ? TAG_PT_TO_EN : TAG_EN_TO_PT
  return table[tag] ?? tag
}

/**
 * Caminho da pagina de uma tag, sempre com a barra final (a canonical tem
 * barra; sem ela o nginx responde 301). Tag com espaco ou acento e codificada.
 * @param {'pt-BR' | 'en'} lang
 * @param {string} tag
 * @returns {string}
 */
export function tagPath(lang, tag) {
  return `/blog/${lang}/tags/${encodeURIComponent(tag)}/`
}

/**
 * @param {'pt-BR' | 'en'} lang
 * @param {string} slug
 * @returns {string}
 */
export function postPath(lang, slug) {
  return `/blog/${lang}/posts/${slug}/`
}
